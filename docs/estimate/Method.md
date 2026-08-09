
# Phương pháp 1: Expert Judgment + Planning Poker + Velocity (khuyến nghị chính)

**Mục tiêu:** Estimate tổng thời gian, effort, token dựa trên độ lớn của User Story và năng suất thực tế của team khi dùng AI.

## Quy trình thực hiện

### Bước 1 — Expert Judgment (estimate ban đầu)

- 1 thành viên đọc User Story.
- Gán **Story Point ban đầu** (theo Fibonacci estimation scale từ 1 tới 13) dựa trên:
    - độ phức tạp logic
    - UI
    - database
    - API/integration
    - testing
    - kinh nghiệm từ project trước
    - Gợi ý của AI

Output: 

|User Story|Initial Story Point|
|---|--:|
|US-01|3|
|US-02|5|
|US-03|8|

---

### Bước 2 — Planning Poker (chốt Story Point)
- Team vote Story Point.
- Nếu chênh lệch lớn → thảo luận.
- Vote lại đến khi thống nhất.

Output:

|User Story|Final Story Point|
|---|--:|
|US-01|5|
|US-02|5|
|US-03|8|

---

### Bước 3 — Tính Velocity từ 50% MVP đã làm

Dữ liệu đã có:
(SP là story points)

|Metric|Value|
|---|--:|
|Completed Story Points|X SP|
|Actual Time|Y ngày|
|Token Used|Z token|

Tính:
**Velocity**
Velocity = Completed SP / (Actual Time)  

**Token consumption rate**
Token / SP = Total Token / Completed SP  

---
### Bước 4 — Estimate phần còn lại

Ví dụ:
Remaining:
```
200 SP
```

Velocity:
```
20 SP/day
```

Token rate:
```
30,000 token/SP
```

Kết quả:
```
Time = 200 / 20 = 10 ngày

Token = 200 × 30,000
       = 6,000,000 token
```

---

## Checklist

✅ 51 User Stories đều có Story Point  
✅ Có ghi lại Initial SP và Final SP  
✅ Có log dữ liệu MVP:

- thời gian
- token
- model AI sử dụng  
    ✅ Có tính Velocity  
    ✅ Có tính Token/SP  
    ✅ Có estimate cuối cùng cần bao nhiêu:
	- thời gian
	- effort
	- token
		để hoàn thành MVP

---

# Phương pháp 2: Three-Point Estimation (PERT)

**Mục tiêu:** Estimate khi chưa có đủ dữ liệu lịch sử hoặc có nhiều yếu tố không chắc chắn.
## Quy trình thực hiện

Với mỗi Epic/User Story, team đưa ra 3 giá trị (bằng phương pháp Expert Judgment - team leader kết hợp sự hỗ trợ của AI để gán OMP cho tất cả feature): 

|Giá trị|Ý nghĩa|
|---|---|
|Optimistic (O)|Nếu mọi thứ thuận lợi|
|Most likely (M)|Khả năng xảy ra nhất|
|Pessimistic (P)|Nếu gặp nhiều vấn đề|

Ví dụ:
Feature: VietQR Payment

|Ngày|Token|
|---|--:|--:|
|O|2|400k|
|M|4|800k|
|P|7|1.5M|

---

Tính giá trị kỳ vọng:
Expected= (O+4M+P) / 6 

Kết quả:
```
Time ≈ 4.17 ngày

Token ≈ 883k
```

Lặp lại cho các Feature/User Story rồi cộng tổng.

---

## Checklist kiểm tra team đã làm đủ chưa

✅ Mỗi Feature/User Story có:
- Optimistic
- Most likely
- Pessimistic

✅ Có công thức tính Expected Value

✅ Có tổng:
- Expected time
- Expected token

✅ Có giải thích các trường hợp rủi ro:
- AI sinh code lỗi
- cần refactor
- API không ổn định
- requirement thay đổi

---

# So sánh nhanh

|                    | PP1: Story Point + Velocity  | PP2: PERT                   |
| ------------------ | ---------------------------- | --------------------------- |
| Dựa trên           | Dữ liệu MVP + consensus team | Đánh giá uncertainty        |
| Cần dữ liệu cũ     | Có                           | Không bắt buộc              |
| Phù hợp AI project | ⭐⭐⭐⭐⭐                        | ⭐⭐⭐⭐                        |
| Output             | Time + Token thực tế hơn     | Time + Token có tính rủi ro |
| Vai trò            | Estimate chính               | Kiểm tra/challenge estimate |

---

## Quy trình cuối cùng mình khuyên team dùng

```
Expert Judgment
        ↓
Planning Poker
        ↓
Story Points
        ↓
Velocity từ MVP
        ↓
Estimate Time + Token (kết quả chính)


Song song:

PERT
        ↓
Estimate theo best/most likely/worst case
        ↓
So sánh với kết quả chính
        ↓
Điều chỉnh nếu chênh lệch lớn
```

Như vậy team có:

- **Một estimate dựa trên dữ liệu thật (PP1)**.
- **Một estimate kiểm tra rủi ro (PP2)**.