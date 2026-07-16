import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const USERS = {
  landlord: 'landlord-poc',
  tenant: 'tenant-poc',
  unrelatedLandlord: 'landlord-unrelated',
  unrelatedTenant: 'tenant-unrelated',
};

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const statusLabels = {
  draft: 'Draft',
  sent: 'Sent',
  proof_submitted: 'Proof Submitted',
  paid: 'Paid',
};

async function api(path, { token, body, method = 'GET', form } = {}) {
  const response = await fetch(path, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(!form && body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: form ?? (body ? JSON.stringify(body) : undefined),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? 'Request failed');
  return payload;
}

function App() {
  const [session, setSession] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState({ outstandingTotal: 0, history: [] });
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState('Chọn một tài khoản thử nghiệm để bắt đầu.');
  const [busy, setBusy] = useState(false);

  async function refresh(activeSession = session, preferredInvoiceId) {
    const [invoiceList, paymentSummary, events] = await Promise.all([
      api('/api/invoices', { token: activeSession.token }),
      api('/api/payments/summary', { token: activeSession.token }),
      api('/api/notifications', { token: activeSession.token }),
    ]);
    setInvoices(invoiceList);
    setSummary(paymentSummary);
    setNotifications(events);
    const invoiceId = preferredInvoiceId ?? selected?.id ?? invoiceList[0]?.id;
    if (invoiceId && invoiceList.some((item) => item.id === invoiceId)) {
      await openInvoice(invoiceId, activeSession);
    } else {
      setSelected(null);
      setHistory([]);
    }
  }

  async function login(userId) {
    setBusy(true);
    try {
      const result = await api('/api/auth/demo', { method: 'POST', body: { userId } });
      setSession(result);
      setSelected(null);
      setHistory([]);
      await refresh(result);
      setMessage(`Đang đăng nhập với vai trò ${result.user.role}: ${result.user.fullName}.`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function openInvoice(id, activeSession = session) {
    const [invoice, statusHistory] = await Promise.all([
      api(`/api/invoices/${id}`, { token: activeSession.token }),
      api(`/api/invoices/${id}/history`, { token: activeSession.token }),
    ]);
    setSelected(invoice);
    setHistory(statusHistory.history);
  }

  async function prepareReferenceBilling() {
    setBusy(true);
    try {
      try {
        await api('/api/meter-readings', {
          token: session.token,
          method: 'POST',
          body: { roomId: 'room-poc', period: '2026-07', electricity: 1320, water: 84 },
        });
      } catch (error) {
        if (!/already exists/i.test(error.message)) throw error;
      }
      const result = await api('/api/billing-runs', {
        token: session.token,
        method: 'POST',
        body: { period: '2026-07', issueDate: '2026-07-01', dueDate: '2026-07-05' },
      });
      const preferred = result.created[0]?.id;
      await refresh(session, preferred);
      const skipText = result.skipped.map((item) => `${item.roomId}: ${item.reason}`).join('; ');
      setMessage(result.created.length
        ? `Đã tạo Draft INV.POC.001. Billing run cũng ghi nhận: ${skipText}`
        : `Không tạo bản trùng. Billing run ghi nhận: ${skipText}`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function saveUtilityRates(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    try {
      await api('/api/properties/property-poc/utility-rates', {
        token: session.token,
        method: 'PATCH',
        body: {
          electricityRate: Number(data.get('electricityRate')),
          waterRate: Number(data.get('waterRate')),
        },
      });
      setMessage('Đã lưu đơn giá cấp Property. Giá mới áp dụng cho billing run tương lai.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function savePaymentSettings(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    try {
      await api('/api/payment-settings', {
        token: session.token,
        method: 'PATCH',
        body: {
          bankBin: data.get('bankBin'),
          bankAccount: data.get('bankAccount'),
          accountHolder: data.get('accountHolder'),
        },
      });
      setMessage('Đã lưu cấu hình VietQR của chủ nhà.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function correctReading(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    try {
      const result = await api(`/api/meter-readings/${selected.meterReadingId}`, {
        token: session.token,
        method: 'PATCH',
        body: { electricity: Number(data.get('electricity')), water: Number(data.get('water')) },
      });
      await refresh(session, result.invoice.id);
      setMessage(result.changed
        ? 'Đã lưu correction audit và tính lại Draft invoice.'
        : 'Chỉ số không thay đổi nên không tạo correction trùng.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function sendInvoice() {
    setBusy(true);
    try {
      const invoice = await api(`/api/invoices/${selected.id}/send`, {
        token: session.token,
        method: 'POST',
      });
      await refresh(session, invoice.id);
      setMessage('Đã chuyển Draft → Sent và ghi mobile-push event mô phỏng cho người thuê.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function uploadProof(event) {
    event.preventDefault();
    const file = event.currentTarget.elements.proof.files[0];
    if (!file) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.append('proof', file);
      const invoice = await api(`/api/invoices/${selected.id}/proof`, {
        token: session.token,
        method: 'POST',
        form,
      });
      await refresh(session, invoice.id);
      setMessage('Đã xác thực chữ ký ảnh và gửi proof; chủ nhà nhận notification event mô phỏng.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function confirmPayment() {
    setBusy(true);
    try {
      const result = await api(`/api/invoices/${selected.id}/confirm`, {
        token: session.token,
        method: 'POST',
      });
      await refresh(session, result.invoice.id);
      setMessage(result.changed
        ? 'Đã tạo Payment record và chuyển invoice sang Paid.'
        : 'Invoice đã Paid; không tạo Payment hoặc history trùng.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function downloadBinary(path, filename) {
    try {
      const response = await fetch(path, { headers: { Authorization: `Bearer ${session.token}` } });
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? 'Download failed');
      }
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => {
    document.title = selected ? `${selected.reference} – RosiHome PoC` : 'RosiHome Billing PoC';
  }, [selected]);

  return (
    <main>
      <header>
        <div>
          <p className="eyebrow">BACKLOG-SYNCHRONIZED PROOF OF CONCEPT</p>
          <h1>RosiHome Billing & VietQR</h1>
          <p>Meter reading → Draft billing → review/send → proof → manual verification.</p>
        </div>
        <div className="status-message">{message}</div>
      </header>

      <section className="card account-panel">
        <div>
          <h2>1. Chọn vai trò thử nghiệm</h2>
          <p>Dữ liệu tổng hợp; hai tài khoản “khác” dùng để kiểm chứng ownership isolation.</p>
        </div>
        <div className="actions">
          <button disabled={busy} onClick={() => login(USERS.landlord)}>Chủ nhà P101</button>
          <button disabled={busy} onClick={() => login(USERS.tenant)}>Người thuê P101</button>
          <button className="secondary" disabled={busy} onClick={() => login(USERS.unrelatedLandlord)}>Chủ nhà khác</button>
          <button className="secondary" disabled={busy} onClick={() => login(USERS.unrelatedTenant)}>Người thuê khác</button>
        </div>
        {session && <p className="identity">Đã đăng nhập: <strong>{session.user.fullName}</strong> ({session.user.role})</p>}
      </section>

      {session?.user.id === USERS.landlord && (
        <section className="setup-grid">
          <form className="card compact-form" onSubmit={saveUtilityRates}>
            <h2>2. Đơn giá Property</h2>
            <label>Điện (VND/kWh)<input name="electricityRate" type="number" min="0" defaultValue="3500" required /></label>
            <label>Nước (VND/m³)<input name="waterRate" type="number" min="0" defaultValue="20000" required /></label>
            <button disabled={busy}>Lưu đơn giá</button>
          </form>
          <form className="card compact-form" onSubmit={savePaymentSettings}>
            <h2>3. Cấu hình VietQR</h2>
            <label>Bank BIN<input name="bankBin" defaultValue="970422" required /></label>
            <label>Số tài khoản<input name="bankAccount" defaultValue="0123456789" required /></label>
            <label>Chủ tài khoản<input name="accountHolder" defaultValue="NGUYEN VAN CHU NHA" required /></label>
            <button disabled={busy}>Lưu VietQR</button>
          </form>
          <article className="card run-panel">
            <h2>4. Billing run tháng 07/2026</h2>
            <p>Ghi chỉ số P101 là 1.320 kWh / 84 m³, tạo Draft và ghi skip reason cho phòng thiếu chỉ số.</p>
            <button disabled={busy} onClick={prepareReferenceBilling}>Chuẩn bị billing tham chiếu</button>
          </article>
        </section>
      )}

      {session && (
        <section className="overview-grid">
          <article className="card">
            <h2>Invoices có quyền truy cập</h2>
            {invoices.length === 0 ? <p>Không có invoice hiển thị cho tài khoản này.</p> : (
              <div className="invoice-list">
                {invoices.map((item) => (
                  <button className="list-item" key={item.id} onClick={() => openInvoice(item.id)}>
                    <span><strong>{item.reference}</strong><small>{item.period}</small></span>
                    <span className={`badge ${item.status}`}>{statusLabels[item.status]}</span>
                  </button>
                ))}
              </div>
            )}
          </article>
          <article className="card metric-card">
            <p className="eyebrow">OUTSTANDING</p>
            <strong>{money.format(summary.outstandingTotal)}</strong>
            <span>{summary.history.length} invoice trong payment history</span>
          </article>
          <article className="card">
            <h2>Notification events</h2>
            {notifications.length === 0 ? <p>Chưa có event cho người dùng này.</p> : (
              <ul className="event-list">
                {notifications.map((event) => <li key={event.id}>{event.type} · {event.channel}</li>)}
              </ul>
            )}
          </article>
        </section>
      )}

      {selected && (
        <section className="invoice-grid">
          <article className="card invoice">
            <div className="invoice-heading">
              <div><p className="eyebrow">HÓA ĐƠN {selected.period}</p><h2>{selected.reference}</h2></div>
              <span className={`badge ${selected.status}`}>{statusLabels[selected.status]}</span>
            </div>
            <p>Ngày phát hành: {selected.issueDate} · Hạn thanh toán: {selected.dueDate}</p>
            <dl>
              <div><dt>Tiền thuê</dt><dd>{money.format(selected.rentAmount)}</dd></div>
              <div><dt>Điện ({selected.previousElectricity} → {selected.currentElectricity})</dt><dd>{selected.electricityUsage} × {money.format(selected.electricityRate)} = {money.format(selected.electricityAmount)}</dd></div>
              <div><dt>Nước ({selected.previousWater} → {selected.currentWater})</dt><dd>{selected.waterUsage} × {money.format(selected.waterRate)} = {money.format(selected.waterAmount)}</dd></div>
              <div><dt>Phí bổ sung</dt><dd>{money.format(selected.additionalFees)}</dd></div>
              <div className="total"><dt>Tổng cộng</dt><dd>{money.format(selected.totalAmount)}</dd></div>
            </dl>

            <div className="actions invoice-actions">
              <button className="secondary" onClick={() => downloadBinary(`/api/invoices/${selected.id}/pdf`, `${selected.reference}.pdf`)}>Tải PDF</button>
              {selected.proof && <button className="secondary" onClick={() => downloadBinary(`/api/invoices/${selected.id}/proof`, selected.proof.originalName)}>Xem proof</button>}
            </div>

            {session.user.role === 'landlord' && selected.status === 'draft' && (
              <form className="correction-form" onSubmit={correctReading}>
                <h3>Sửa chỉ số khi còn Draft</h3>
                <label>Điện<input name="electricity" type="number" min={selected.previousElectricity} defaultValue={selected.currentElectricity} required /></label>
                <label>Nước<input name="water" type="number" min={selected.previousWater} defaultValue={selected.currentWater} required /></label>
                <button disabled={busy}>Lưu correction</button>
                <button type="button" disabled={busy} onClick={sendInvoice}>Duyệt và gửi tenant</button>
              </form>
            )}

            {session.user.role === 'tenant' && selected.status === 'sent' && (
              <form onSubmit={uploadProof}>
                <label htmlFor="proof">Proof JPEG/PNG hợp lệ, tối đa 5 MB</label>
                <input id="proof" name="proof" type="file" accept="image/jpeg,image/png" required />
                <button disabled={busy}>Gửi bằng chứng</button>
              </form>
            )}

            {session.user.role === 'landlord' && selected.status === 'proof_submitted' && (
              <button disabled={busy} onClick={confirmPayment}>Đã kiểm tra ngân hàng – Xác nhận Paid</button>
            )}
          </article>

          <aside className="card qr-panel">
            <h2>VietQR</h2>
            <img src={selected.qrDataUrl} alt={`VietQR cho ${selected.reference}`} />
            <p>QR chứa chính xác số tiền và reference; quét thử nhưng không chuyển tiền.</p>
          </aside>

          <article className="card history">
            <h2>Audit history</h2>
            <ol>
              {history.map((item) => (
                <li key={item.id}>
                  <strong>{item.previousStatus ?? 'Khởi tạo'} → {item.newStatus}</strong>
                  <span>Actor: {item.actorId}</span>
                  <span>{new Date(item.createdAt).toLocaleString('vi-VN')}</span>
                </li>
              ))}
            </ol>
          </article>
        </section>
      )}
    </main>
  );
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);
