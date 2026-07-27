
# Software Project Estimation Document

## 1. Introduction

### 1.1 Purpose

- Mục đích của tài liệu.
    
### 1.2 Project Overview

- Mô tả dự án.
    
- Công nghệ sử dụng.
    
- Quy mô dự án.
    
- Team size.
    
- Agile process.
    

### 1.3 Scope

#### 1.3.1 In Scope

- Các Epic/Module được estimate.
    

#### 1.3.2 Out of Scope

- Các hạng mục không nằm trong estimation.
    

---

## 2. Estimation Methodology

### 2.1 Overall Estimation Process

```
Product Backlog
        ↓
Expert Judgment
        ↓
Planning Poker
        ↓
Story Points (User Story)
        ↓
Velocity (50% MVP)
        ↓
Most Likely (Feature)
        ↓
PERT
        ↓
Final Estimation
```

### 2.2 Assumptions

- Requirement ổn định.
    
- MVP đã hoàn thành khoảng 50%.
    
- Story Point sử dụng Fibonacci.
    
- Team gồm 5 developers.
    
- AI hỗ trợ phát triển và testing.
    

### 2.3 Estimation Metrics

#### 2.3.1 Story Point

#### 2.3.2 Velocity

#### 2.3.3 Effort

#### 2.3.4 AI Token Consumption

---

## 3. Story Point Estimation

### 3.1 Expert Judgment

- Initial Story Point được gán bởi một thành viên kết hợp AI hỗ trợ.
    

### 3.2 Planning Poker

- Voting.
    
- Discussion.
    
- Consensus.
    

### 3.3 Story Point Result

|User Story|Initial SP|Final SP|
|---|--:|--:|
|US-01|3|5|
|US-02|8|8|

---

## 4. Velocity-Based Estimation

### 4.1 MVP Performance Data

|Metric|Value|
|---|--:|
|Completed Story Points||
|Completed User Stories||
|Actual Development Time||
|AI Tokens Used||

### 4.2 Velocity Calculation

- Velocity (SP/day)
    
- Token per Story Point
    

### 4.3 Remaining Work Estimation

|Metric|Value|
|---|--:|
|Remaining Story Points||
|Estimated Time||
|Estimated Effort||
|Estimated AI Tokens||

---

## 5. Three-Point Estimation (PERT)

### 5.1 Estimation Factors

Xây dựng bảng **Effort Complexity Factors** dùng để đánh giá mức độ phức tạp của từng **Feature**.

Ví dụ:

|Factor|Score|
|---|--:|
|Complex business logic||
|Third-party API integration||
|Security-sensitive functionality||
|AI-generated unfamiliar code||
|Performance optimization||
|Requirement ambiguity||

Quy tắc quy đổi:

|Complexity Score|O|P|
|--:|--:|--:|
|0–2|0.90M|1.20M|
|3–5|0.85M|1.40M|
|6–8|0.80M|1.70M|
|>8|0.70M|2.00M|

> **Most Likely (M)** được tính từ Velocity của MVP; chỉ **O** và **P** được điều chỉnh theo Complexity Score.

### 5.2 PERT Estimation Result

|Feature|Complexity Score|O|M|P|Expected|
|---|--:|--:|--:|--:|--:|

### 5.3 Estimation Validation

|Method|Estimated Time|Estimated Token|
|---|--:|--:|
|Velocity|||
|PERT|||

- So sánh kết quả giữa hai phương pháp.
    
- Phân tích nếu có sai khác đáng kể.
    

---

## 6. Final Estimation Summary

### 6.1 Overall Estimation

|Item|Value|
|---|--:|
|Total Story Points||
|Completed Story Points||
|Remaining Story Points||
|Velocity||
|Estimated Time||
|Estimated Effort||
|Estimated AI Tokens||

### 6.2 Conclusion

- Tóm tắt kết quả estimation.
    
- Đánh giá mức độ nhất quán giữa Velocity và PERT.
    
- Giải thích phương pháp được chọn làm kết quả cuối cùng.
    

---

## Appendix

### A. User Story List

- Danh sách User Stories.
    

### B. Planning Poker Records

- Log các vòng voting.
    

### C. Velocity Calculation Details

- Bảng tính Velocity và Token/SP.
    

### D. Feature Mapping

- Mapping Epic → Feature → User Stories.
    

### E. PERT Calculation Details

- Bảng tính Complexity Score, O/M/P và Expected cho từng Feature.
    