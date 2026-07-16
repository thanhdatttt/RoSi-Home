import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const USERS = {
  landlord: 'landlord-maintenance-poc',
  tenant: 'tenant-maintenance-poc',
  unrelatedLandlord: 'landlord-maintenance-unrelated',
  unrelatedTenant: 'tenant-maintenance-unrelated',
};

const STATUS_LABELS = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
};

const NEXT_STATUS = {
  pending: 'in_progress',
  in_progress: 'completed',
  completed: null,
};

async function api(path, { token, body, method = 'GET' } = {}) {
  const response = await fetch(path, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? 'Request failed');
  return payload;
}

function App() {
  const [session, setSession] = useState(null);
  const [filter, setFilter] = useState('all');
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [roomHistory, setRoomHistory] = useState(null);
  const [message, setMessage] = useState('Chọn một tài khoản thử nghiệm để bắt đầu.');
  const [busy, setBusy] = useState(false);

  async function refresh(activeSession = session, activeFilter = filter, preferredId) {
    const query = activeFilter === 'all' ? '' : `?status=${activeFilter}`;
    const [requestList, events] = await Promise.all([
      api(`/api/maintenance-requests${query}`, { token: activeSession.token }),
      api('/api/notifications', { token: activeSession.token }),
    ]);
    setRequests(requestList);
    setNotifications(events);
    const requestId = preferredId ?? selected?.id ?? requestList[0]?.id;
    if (requestId && requestList.some((item) => item.id === requestId)) {
      await openRequest(requestId, activeSession);
    } else {
      setSelected(null);
      setRoomHistory(null);
    }
  }

  async function login(userId) {
    setBusy(true);
    try {
      const result = await api('/api/auth/demo', { method: 'POST', body: { userId } });
      setSession(result);
      setFilter('all');
      setSelected(null);
      setRoomHistory(null);
      await refresh(result, 'all');
      setMessage(`Đã đăng nhập: ${result.user.fullName} (${result.user.role}).`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function changeFilter(nextFilter) {
    setFilter(nextFilter);
    setBusy(true);
    try {
      await refresh(session, nextFilter);
      setMessage(`Đang lọc theo: ${nextFilter === 'all' ? 'tất cả' : STATUS_LABELS[nextFilter]}.`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function openRequest(id, activeSession = session) {
    const detail = await api(`/api/maintenance-requests/${id}`, { token: activeSession.token });
    setSelected(detail);
    setRoomHistory(null);
  }

  async function updateStatus(nextStatus) {
    setBusy(true);
    try {
      const result = await api(`/api/maintenance-requests/${selected.id}/status`, {
        token: session.token,
        method: 'PATCH',
        body: { status: nextStatus },
      });
      await refresh(session, filter, result.request.id);
      setMessage(result.changed
        ? `Đã chuyển ${STATUS_LABELS[result.request.history.at(-1).previousStatus]} → ${STATUS_LABELS[nextStatus]} và tạo mobile-push event mô phỏng.`
        : 'Trạng thái không đổi; không tạo history hoặc notification trùng.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function loadRoomHistory() {
    setBusy(true);
    try {
      const result = await api(`/api/rooms/${selected.room.id}/maintenance-history`, { token: session.token });
      setRoomHistory(result);
      setMessage(`Đã tải ${result.requests.length} maintenance request của phòng ${result.room.name}.`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    document.title = selected ? `${selected.title} – RosiHome` : 'RosiHome Maintenance PoC';
  }, [selected]);

  return (
    <main>
      <header>
        <div>
          <p className="eyebrow">PROOF OF CONCEPT · F-13</p>
          <h1>Maintenance Status Tracking</h1>
          <p>Luồng kiểm chứng: Pending → In Progress → Completed.</p>
        </div>
        <div className="status-message">{message}</div>
      </header>

      <section className="card account-panel">
        <div>
          <h2>1. Chọn vai trò thử nghiệm</h2>
          <p>Hai portfolio riêng biệt dùng để kiểm tra role và ownership ở backend.</p>
        </div>
        <div className="actions">
          <button disabled={busy} onClick={() => login(USERS.landlord)}>Chủ nhà P101</button>
          <button disabled={busy} onClick={() => login(USERS.tenant)}>Người thuê P101</button>
          <button className="secondary" disabled={busy} onClick={() => login(USERS.unrelatedLandlord)}>Chủ nhà khác</button>
          <button className="secondary" disabled={busy} onClick={() => login(USERS.unrelatedTenant)}>Người thuê khác</button>
        </div>
        {session && <p className="identity">Phiên hiện tại: <strong>{session.user.fullName}</strong> ({session.user.role})</p>}
      </section>

      {session && (
        <>
          <section className="toolbar card">
            <div>
              <h2>2. Lọc maintenance requests</h2>
              <p>Review hoặc lọc danh sách không tự thay đổi trạng thái.</p>
            </div>
            <div className="filter-group">
              {['all', 'pending', 'in_progress', 'completed'].map((item) => (
                <button
                  className={filter === item ? 'active' : 'secondary'}
                  disabled={busy}
                  key={item}
                  onClick={() => changeFilter(item)}
                >
                  {item === 'all' ? 'All' : STATUS_LABELS[item]}
                </button>
              ))}
            </div>
          </section>

          <section className="workspace-grid">
            <aside className="card request-list">
              <div className="section-heading">
                <h2>Requests</h2><span>{requests.length}</span>
              </div>
              {requests.length === 0 ? <p>Không có request phù hợp.</p> : requests.map((item) => (
                <button className="request-item" key={item.id} onClick={() => openRequest(item.id)}>
                  <span><strong>{item.title}</strong><small>{item.property.name} · {item.room.name}</small></span>
                  <span className={`badge ${item.status}`}>{STATUS_LABELS[item.status]}</span>
                </button>
              ))}
            </aside>

            {selected ? (
              <article className="card detail">
                <div className="detail-heading">
                  <div>
                    <p className="eyebrow">{selected.property.name} · {selected.room.name}</p>
                    <h2>{selected.title}</h2>
                  </div>
                  <span className={`badge ${selected.status}`}>{STATUS_LABELS[selected.status]}</span>
                </div>
                <p className="description">{selected.description}</p>
                <dl>
                  <div><dt>Tenant</dt><dd>{selected.tenant.fullName}</dd></div>
                  <div><dt>Submitted</dt><dd>{new Date(selected.submittedAt).toLocaleString('vi-VN')}</dd></div>
                  <div><dt>Attachments</dt><dd>{selected.attachments.length} (F-12 excluded)</dd></div>
                </dl>

                <div className="actions detail-actions">
                  {session.user.role === 'landlord' && NEXT_STATUS[selected.status] && (
                    <button disabled={busy} onClick={() => updateStatus(NEXT_STATUS[selected.status])}>
                      Chuyển sang {STATUS_LABELS[NEXT_STATUS[selected.status]]}
                    </button>
                  )}
                  {session.user.role === 'landlord' && (
                    <button className="secondary" disabled={busy} onClick={loadRoomHistory}>Xem history phòng</button>
                  )}
                  {session.user.role === 'tenant' && <span className="read-only">Tenant view: chỉ đọc</span>}
                </div>

                <section className="timeline">
                  <h3>Status history</h3>
                  <ol>
                    {selected.history.map((entry) => (
                      <li key={entry.id}>
                        <span className="timeline-dot" />
                        <div>
                          <strong>{entry.previousStatus ? STATUS_LABELS[entry.previousStatus] : 'Created'} → {STATUS_LABELS[entry.newStatus]}</strong>
                          <small>{entry.actorId} · {new Date(entry.createdAt).toLocaleString('vi-VN')}</small>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              </article>
            ) : <article className="card empty-detail"><p>Chọn một request để xem chi tiết.</p></article>}

            <aside className="card notifications">
              <div className="section-heading"><h2>Push events</h2><span>{notifications.length}</span></div>
              <p className="hint">PoC lưu event `mobile_push_simulated`; không tạo Web notification.</p>
              {notifications.length === 0 ? <p>Chưa có event cho tài khoản này.</p> : (
                <ul>
                  {notifications.map((event) => (
                    <li key={event.id}>
                      <strong>{event.type}</strong>
                      <small>{event.requestId}<br />{new Date(event.createdAt).toLocaleString('vi-VN')}</small>
                    </li>
                  ))}
                </ul>
              )}
            </aside>
          </section>

          {roomHistory && (
            <section className="card room-history">
              <div className="section-heading"><h2>Maintenance history · {roomHistory.room.name}</h2><span>{roomHistory.requests.length}</span></div>
              <div className="history-grid">
                {roomHistory.requests.map((item) => (
                  <article key={item.id}>
                    <span className={`badge ${item.status}`}>{STATUS_LABELS[item.status]}</span>
                    <h3>{item.title}</h3>
                    <p>{item.history.length} history entries · {new Date(item.submittedAt).toLocaleDateString('vi-VN')}</p>
                  </article>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);
