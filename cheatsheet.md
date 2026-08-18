# Cheatsheet vấn đáp Quản lý dự án phần mềm - RosiHome

Tài liệu này là đề cương trả lời cho câu 1, 2, 3 và 21 trong đề vấn đáp cuối kỳ. Nội dung được viết theo dự án RosiHome và các tài liệu hiện có trong repository, không phải câu trả lời lý thuyết chung chung.

## 0. Phân biệt nguồn tài liệu và yêu cầu

### Nguồn chính

- **Đề thi PDF**: xác định câu hỏi chính, các câu hỏi thường gặp và yêu cầu nộp bản in. Câu 1, 2, 3 nằm ở trang 1; câu 21 nằm ở trang 5.
- **`note.pdf`**: ghi chú và định hướng làm bài của nhóm. Đây là nguồn gợi ý phương pháp, không thay thế cho sự thật thực tế của nhóm.
- **Tài liệu dự án trong repository**: là bằng chứng để trả lời dự án đã làm gì, ai làm, dùng quy trình nào và kết quả ra sao.

### Yêu cầu của đề, không phải nội dung phải trả lời

Theo đề thi, khi thi phải viết bằng giấy bút trên giấy A4, không dùng tài liệu trong lúc trả lời, đồng thời nộp các bản in tài liệu và giao diện liên quan để hỗ trợ giải thích. Các hướng dẫn chuẩn bị túi đề, phiếu câu hỏi, quy trình bốc câu và đổi câu trong PDF không phải là câu hỏi kiến thức cần chép vào câu trả lời.

### Công thức trả lời mọi câu hỏi tài liệu

Khi giảng viên hỏi về một tài liệu, trả lời theo thứ tự:

1. Tài liệu này là gì và giải quyết vấn đề quản lý nào?
2. Tài liệu trả lời những câu hỏi chính nào?
3. Nhóm lấy đầu vào từ đâu?
4. Nhóm đã tạo tài liệu qua những bước nào?
5. Nhóm đánh giá tài liệu bằng tiêu chí và bằng chứng nào?
6. Tài liệu được dùng để ra quyết định nào trong dự án?
7. Tài liệu được cập nhật hoặc kiểm soát thay đổi ra sao?
8. Trade-off quan trọng là gì: vì sao chọn cách này thay vì cách khác?

Không nên nói “AI làm hết”. Cách trình bày tốt hơn là: AI hỗ trợ nghiên cứu, tổng hợp, phản biện hoặc tạo bản nháp; nhóm cung cấp context, tự kiểm tra nguồn, đối chiếu với code/dữ liệu, review và chốt quyết định.

## 1. Thông tin nền cần nhớ về RosiHome

| Nội dung | Câu trả lời ngắn |
|---|---|
| Tên dự án | RosiHome - nền tảng quản lý nhà trọ cho chủ trọ tự quản lý |
| Vấn đề | Chủ trọ nhỏ dùng sổ tay, Excel, máy tính, Zalo và ứng dụng ngân hàng rời rạc để tính tiền, thu tiền, theo dõi hợp đồng và xử lý bảo trì |
| Khách hàng chính | Chủ trọ tự quản lý khoảng 1-30 phòng/căn |
| Người dùng phụ | Người thuê phòng |
| Giá trị | Tập trung dữ liệu, tự động tính tiền thuê/điện/nước, minh bạch thanh toán, nhắc hạn hợp đồng, theo dõi bảo trì, dashboard |
| MVP | Authentication, property/room, tenant, lease, utility, invoice, VietQR, payment proof/manual verification, maintenance, dashboard, notification |
| Không thuộc MVP | AI analytics, payment gateway trực tiếp, chữ ký điện tử, IoT smart meter, multi-landlord collaboration, advanced accounting |
| Nhóm | 3 backend, 2 frontend; Chí đồng thời là Project Manager/Team Leader và BE1 |
| Thời gian | Baseline sponsor-facing là 8-10 tuần, expected estimate hiện tại là khoảng 9 tuần |
| Kiến trúc | Monolithic 3-layer client-server: React/React Native, Node.js/Express REST API, PostgreSQL và cloud storage |
| Thanh toán | RosiHome chỉ tạo VietQR và lưu payment proof; tiền chuyển trực tiếp từ ngân hàng tenant sang ngân hàng landlord; landlord tự xác minh |

## 2. Câu 1 - Project Proposal

### 2.1. Câu mở đầu nên nói

> Project Proposal là tài liệu trả lời câu hỏi **Why should this project exist?** Nó chứng minh vấn đề có thật và đáng giải quyết, khách hàng/người dùng là ai, giải pháp có giá trị gì, có khả thi trong giới hạn thời gian - chi phí - nguồn lực hay không, và vì sao nhóm nên tiếp tục đầu tư vào ý tưởng RosiHome.

Project Proposal không phải là bản thiết kế kỹ thuật chi tiết và cũng chưa phải là kế hoạch thực thi đầy đủ. Nó là cơ sở để sponsor và nhóm quyết định có nên khởi động dự án, với phạm vi và giả định ban đầu nào.

### 2.2. Các câu hỏi chính Proposal phải trả lời

1. **Why - Tại sao làm?** Vấn đề, pain point, nguyên nhân, tác động và bằng chứng vấn đề tồn tại.
2. **Who - Ai liên quan?** Sponsor, khách hàng, người dùng, team, đối tác ngoài và các stakeholder khác.
3. **What - Làm sản phẩm gì?** Giải pháp, use case chính, giá trị đem lại và deliverables cấp cao.
4. **Market - Đã có ai giải quyết chưa?** Đối thủ trực tiếp, công cụ thay thế, điểm mạnh/yếu và khoảng trống thị trường.
5. **Business - Có đáng làm không?** Business case, lợi ích, mô hình giá trị/doanh thu và khả năng tạo lợi ích cho khách hàng.
6. **Feasibility - Có làm được không?** Khả thi về kỹ thuật, vận hành, lịch, chi phí, nguồn lực và người dùng.
7. **Risk - Có thể thất bại ở đâu?** Rủi ro chính, khả năng xảy ra, tác động và hướng giảm thiểu.
8. **Constraint - Phải tuân theo giới hạn nào?** Deadline học kỳ, 5 thành viên part-time, ngân sách, công nghệ, dịch vụ bên thứ ba và scope MVP.
9. **Decision - Quyết định đề xuất là gì?** Tiếp tục, thay đổi, thu nhỏ hoặc dừng dự án; kèm lý do và điều kiện.

Trong Proposal của RosiHome, các câu hỏi trên được thể hiện qua problem statement, business case, stakeholder analysis, competitor analysis, feasibility, budget, time, risk, high-level features, elevator pitch và vision dài hạn.

### 2.3. Quá trình nhóm hình thành Proposal

#### Bước 1 - Hình thành ý tưởng từ trải nghiệm thực tế

Nhóm bắt đầu với ý tưởng số hóa việc quản lý nhà trọ. Một số thành viên là sinh viên đang thuê trọ và thường xuyên tương tác với chủ trọ, nên nhóm có hiểu biết thực tế ban đầu về cách chủ trọ tính tiền, thu tiền, trao đổi với tenant và xử lý vấn đề trong phòng. Từ đó nhóm nhận thấy các workflow này thường bị phân tán giữa sổ tay, Excel, máy tính, Zalo và ứng dụng ngân hàng.

#### Bước 2 - Kiểm duyệt ý tưởng bằng AI và nghiên cứu giải pháp thay thế

Trước khi viết Proposal, nhóm chưa mặc nhiên cho rằng ý tưởng nên được thực hiện. Nhóm dùng AI để kiểm duyệt theo các câu hỏi chính:

1. **Search extensively:** tìm thật kỹ trên thị trường xem đã có giải pháp nào giải quyết cùng bài toán hay chưa, các competitor solutions là gì và họ đang hỗ trợ workflow nào.
2. **Composition of existing tools:** hỏi sự kết hợp của các giải pháp có sẵn như Excel, Zalo, calculator, calendar và bank app có thể giải quyết toàn bộ vấn đề hay không.
3. **Go/no-go discussion:** dựa trên kết quả competitor research và composition analysis, hỏi liệu nhóm còn nên thực hiện ý tưởng không, nếu có thì lý do là gì.
4. **Open-source search:** kiểm tra xem đã có dự án open source nào có đầy đủ tính năng tương đương với giải pháp nhóm dự định làm hay chưa.

Kết quả kiểm tra cho thấy ý tưởng không mới và đã có nhiều sản phẩm cùng lĩnh vực. Tuy nhiên, điều đó chứng minh nhu cầu thị trường là có thật; đồng thời các giải pháp hiện tại vẫn còn điểm chưa tốt về UI, feature, workflow hai phía và mức độ tích hợp giữa nhiều công cụ.

#### Bước 3 - Xin ý kiến giảng viên và quyết định tiếp tục

Vì nhận ra nhiều người đã làm sản phẩm tương tự, nhóm đã phân vân và hỏi ý kiến thầy. Nhóm nhận được định hướng rằng điều quan trọng không phải là có tính năng “xịn” hoặc hoàn toàn mới, mà là sản phẩm có hỗ trợ đúng quy trình và giải quyết đúng nhu cầu hay không.

Nhóm cũng nhận thấy các thành viên là sinh viên thuê trọ nên có cơ hội quan sát và tương tác nhiều với chủ trọ. Kết hợp với những hạn chế của các app hiện tại về UI, tính năng và tích hợp, nhóm quyết định vẫn thực hiện RosiHome nhưng tập trung vào một workflow đơn giản, phù hợp với chủ trọ tự quản lý.

#### Bước 4 - Tạo bản Proposal theo format môn học

Sau khi quyết định tiếp tục, nhóm dùng AI để tạo bản nháp Proposal dựa trên format và nội dung yêu cầu trong slide/tài liệu môn học. Các nội dung được tổng hợp gồm problem, stakeholders, solution, competitors, feasibility, time, cost, risk, scope và business case.

#### Bước 5 - Đánh giá lặp và sửa bởi cả nhóm

Nhóm dùng AI khác để đánh giá và phản biện bản Proposal. Quy trình được lặp lại: AI đánh giá, nhóm xem các điểm thiếu/mâu thuẫn, sửa nội dung, rồi tiếp tục review. Cuối cùng, cả team đọc và chỉnh sửa nhiều vòng cho đến khi thấy tài liệu hợp lý, nhất quán với dự án và phù hợp với scope có thể thực hiện.

AI chỉ tạo bản nháp, tìm kiếm và phản biện; quyết định cuối cùng thuộc về con người. Nhóm phải tự đọc, đối chiếu với trải nghiệm rồi chốt Proposal cuối cùng.


### 2.4. Đầu vào và dữ liệu hình thành Proposal

Đầu vào trực tiếp để tổng hợp Proposal là các file đã được nhóm chuẩn bị trong thư mục [`docs/proposal/`](docs/proposal/), gồm business case, budget, cost, feasibility, pain point/problem, risks, stakeholders và time. Các file này chứa các mảnh thông tin ban đầu; sau đó nhóm tổng hợp chúng thành `docs/proposal.md` theo format của tài liệu môn học.

| File đầu vào | Vai trò trong việc hình thành Proposal |
|---|---|
| [`business_case.md`](docs/proposal/business_case.md) | Câu chuyện thực tế của chủ trọ, cách RosiHome giải quyết vấn đề và lợi ích dự kiến. |
| [`budget.md`](docs/proposal/budget.md) | Khoản ngân sách sơ bộ cần có để xây dựng và pilot MVP. |
| [`cost.md`](docs/proposal/cost.md) | Chi tiết các nhóm chi phí: development tools, AI/API, cloud, domain/security và contingency. |
| [`feasibility.md`](docs/proposal/feasibility.md) | Đánh giá tính khả thi về vận hành, kinh tế, lịch, pháp lý/compliance và điều kiện để giữ MVP khả thi. |
| [`pain_point_and_problem.md`](docs/proposal/pain_point_and_problem.md) | Persona, pain point, problem statement và evidence cho thấy vấn đề của landlord/tenant là có thật. |
| [`risks.md`](docs/proposal/risks.md) | Các rủi ro chính của ý tưởng/dự án và hướng mitigation/contingency. |
| [`stakeholders.md`](docs/proposal/stakeholders.md) | Danh sách stakeholder, vai trò và nhu cầu của landlord, tenant, team, university và external providers. |
| [`time.md`](docs/proposal/time.md) | Cơ sở ước lượng 8-10 tuần, các phase chính và cách AI/team capacity ảnh hưởng tới timeline. |

Sau khi Proposal được tổng hợp, nội dung tiếp tục được liên kết với các tài liệu quản lý khác như Vision and Scope, Project Charter, Product Backlog, Architecture, Estimate và Risk Management Plan.

### 2.5. Sản phẩm cạnh tranh trực tiếp

Nên trả lời theo hai lớp:

#### Đối thủ là sản phẩm/phần mềm

- **EasyTro**: chạy trên Zalo Mini App, có billing, VietQR, debt tracking và contract management; hạn chế là onboarding và tenant setup chưa thật sự rõ ràng.
- **Resident**: là sản phẩm property/rental management đã được dùng để chứng minh thị trường có nhu cầu; cần phân biệt đây là sản phẩm tham chiếu/đối thủ trong phân tích thị trường, không phải nền tảng nhóm đang dùng.
- **Quản lý trọ - CL Team**: hỗ trợ room, utility, tenant, contract, debt và report; hạn chế gồm Android-only, tenant workflow yếu và một số thao tác payment vẫn thủ công.

#### Đối thủ là cách làm thay thế

Excel/Google Sheets + notebook + calculator + Zalo + calendar + bank app. Cách này “miễn phí” về tiền nhưng không miễn phí về thời gian và sai sót. Landlord phải làm integration layer giữa các công cụ.

#### RosiHome khác ở đâu?

- tập trung landlord tự quản lý 1-30 units;
- có tenant account, không chỉ landlord-facing;
- nối billing - payment - lease - maintenance thành một workflow;
- dùng VietQR nhưng không giữ tiền và không giả vờ có automatic bank verification;
- localized cho quy trình thuê nhà ở Việt Nam;
- scope nhẹ hơn enterprise property management.

Không nên nói “RosiHome không có đối thủ”. Có đối thủ nghĩa là thị trường đã được chứng minh; lợi thế của nhóm là execution, workflow hai phía, localization và khả năng thu thập dữ liệu để phát triển sau này.

### 2.6. Proposal được đánh giá như thế nào?

#### Cách nhóm tạo và đánh giá bộ tiêu chí

Team dùng ChatGPT với prompt yêu cầu **search extensively**, đồng thời gửi format và nội dung yêu cầu trong slide/tài liệu của giảng viên để ChatGPT đề xuất một bộ **10 tiêu chí đánh giá Proposal** phù hợp với môn Quản lý dự án phần mềm.

Sau đó team dùng Claude để phản biện lại bộ 10 tiêu chí này. Claude được cung cấp thêm context rằng đây là scope của môn Software Project Management, dự án có 5 thành viên và Proposal đang được đánh giá cho một dự án học kỳ. Team và AI tiếp tục phản biện qua lại nhiều vòng: kiểm tra tiêu chí có bị trùng, thiếu, quá rộng, quá thiên về startup/business hoặc không phù hợp với quy mô dự án hay không. Khi thấy bộ tiêu chí đã phù hợp, team chốt lại thành `docs/proposal_evaluation/criteria.md`.

Quy trình này không có nghĩa là lấy nguyên văn output của AI. AI đề xuất và phản biện; cả team đọc, so sánh với scope môn học, sửa nội dung và quyết định cuối cùng.

#### 10 tiêu chí đánh giá Proposal

Theo bộ tiêu chí đã chốt trong `docs/proposal_evaluation/criteria.md`, Proposal được đánh giá theo 10 nhóm:

1. pain points/problem/needs có rõ và có evidence không;
2. market và stakeholder có xác định đúng không;
3. solution/use case có trực tiếp giải quyết vấn đề không;
4. competitor, weakness và differentiation/USP;
5. risks, strengths, opportunities và long-term vision;
6. business goals và expected benefits có đo lường được không;
7. customer discovery có bằng chứng thật hay chỉ là giả định;
8. high-level features và expected artifacts có rõ, đúng scope không;
9. budget và timing có khả thi với team không;
10. context diagram và elevator pitch có đúng boundary, ngắn gọn và thuyết phục không.

#### Kết quả đánh giá của nhóm

Tài liệu đánh giá nội bộ nhận xét Proposal có problem statement, business case, stakeholders, feasibility, budget, timeline, risk assessment, competitor analysis và roadmap; ước lượng khoảng **8.8-9.0/10**. Điểm yếu chính là **customer discovery**: cần phỏng vấn/survey thêm chủ trọ thật để biến giả định thành bằng chứng.

Khi nói con số này, phải nói rõ đây là đánh giá nội bộ theo bộ tiêu chí, không phải điểm chính thức của giảng viên.

#### Trade-off cần nói

- Không làm enterprise platform: giảm scope và thời gian học kỳ, đổi lại chưa đáp ứng property manager lớn.
- Không tích hợp payment gateway: giảm rủi ro pháp lý/kỹ thuật, đổi lại landlord phải manual verify.
- Không làm AI trong MVP: giảm phụ thuộc dữ liệu, token và quality risk, đổi lại chưa có decision intelligence.
- Dùng monolith thay vì microservices: dễ build/deploy/debug cho 5 người trong 8-10 tuần, đổi lại ít tối ưu cho scale rất lớn.
- Dùng REST thay vì GraphQL: đơn giản và dễ kiểm thử, đổi lại ít linh hoạt hơn cho nested query phức tạp.

### 2.7. Vì sao cần tạo Proposal?

1. Kiểm tra trước khi code rằng nhóm đang giải quyết đúng vấn đề.
2. Thống nhất “why” giữa sponsor, team và stakeholder.
3. So sánh giải pháp với đối thủ và công cụ đang có.
4. Ước lượng sơ bộ về lợi ích, thời gian, chi phí và rủi ro.
5. Quyết định tiếp tục, thu nhỏ, đổi hướng hoặc dừng dự án.
6. Tạo baseline để các tài liệu sau như Vision/Scope, Charter, Backlog và Estimate không đi lệch nhau.
7. Là cơ sở giải thích tại sao scope MVP được chọn và tại sao một số tính năng bị loại.

### 2.8. Proposal được dùng và cập nhật trong quá trình thực hiện

- Proposal cung cấp **Why** và business context cho Vision and Scope.
- Charter dùng Proposal để formalize purpose, objectives, scope, stakeholders, authority và governance.
- Architecture kiểm tra solution có thể triển khai với stack và resource thật không.
- Estimate/Project Plan/SOW dùng Proposal để chốt time, cost, resources, milestones và acceptance.
- Risk Management Plan cập nhật các rủi ro đã xuất hiện khi code, tích hợp, dùng AI và phụ thuộc dịch vụ ngoài.

Proposal không cần sửa cho mọi thay đổi code nhỏ. Nếu thay đổi làm ảnh hưởng business objective, target user, scope MVP, deadline, budget hoặc feasibility thì phải qua change control và cập nhật Proposal hoặc tài liệu baseline liên quan. Nếu chỉ là implementation detail trong scope đã duyệt thì cập nhật backlog/architecture/issue/PR là đủ.

### 2.9. Các câu hỏi lý thuyết đi kèm câu 1

#### Dự án phần mềm là gì?

Project là một nỗ lực **tạm thời**, có điểm bắt đầu và kết thúc, được thực hiện để tạo ra một sản phẩm, dịch vụ hoặc kết quả **độc nhất**. Dự án có mục tiêu, phạm vi, nguồn lực, ràng buộc và stakeholder. RosiHome là dự án vì nhóm có deadline học kỳ, deliverable MVP và mục tiêu kết thúc rõ ràng.

#### Project, operation, program, portfolio

| Khái niệm | Bản chất | Ví dụ với RosiHome |
|---|---|---|
| Project | Tạm thời, tạo output/result độc nhất | Xây và bàn giao RosiHome MVP trong 8-10 tuần |
| Operation | Hoạt động lặp lại, liên tục để duy trì business | Sau này vận hành server, support landlord, xử lý billing hàng tháng |
| Program | Nhóm project liên quan được quản lý phối hợp để đạt benefit lớn hơn | Một chương trình gồm MVP, AI assistant, benchmark data và go-to-market |
| Portfolio | Tập hợp project/program/operation được chọn để phục vụ chiến lược; không nhất thiết liên quan trực tiếp | Toàn bộ các dự án sản phẩm/phần mềm của một công ty |

Project tạo ra sản phẩm; operation duy trì giá trị; program tối ưu benefit liên kết; portfolio tối ưu chiến lược và đầu tư.

#### Dự án phần mềm đến từ đâu?

Thường đến từ: vấn đề thực tế (practical problem), mối quan hệ -> RFP, kiến thức + kinh nghiệm (knowledge + experience) -> topic, research

#### Phạm vi dự án là gì?

Project scope là ranh giới của công việc và kết quả dự án: sản phẩm nào phải tạo, capability nào có, deliverable/acceptance nào phải đạt, và cái gì không làm. Scope RosiHome gồm property, tenant, lease, utility, invoice, VietQR, payment proof/manual verification, maintenance, dashboard và notification; loại trừ AI analytics, payment gateway, e-signature, IoT và advanced accounting.

#### Vai trò thường có trong dự án phần mềm

- Sponsor: cấp quyền, duyệt baseline và quyết định cấp cao.
- Project Manager: lập kế hoạch, phối hợp, theo dõi, quản lý risk/change/communication và chịu trách nhiệm delivery.
- Product Owner/Client: đại diện cho bên đặt hàng và người dùng; xác định nhu cầu, ưu tiên user story, giải thích yêu cầu và xác nhận sản phẩm đã đáp ứng acceptance criteria hay chưa.
- Business Analyst: phân tích problem, workflow, requirement và acceptance criteria.
- Architect/Technical Lead: quyết định architecture, data và technical trade-off.
- Developer: thiết kế, code, test, fix và documentation kỹ thuật.
- QA/Test: lập test, kiểm tra chất lượng, regression và bằng chứng acceptance.
- DevOps/Release: CI/CD, environment, deployment, monitoring và rollback.
- End user: dùng thử, phản hồi usability và xác nhận workflow.
#### Các loại kết quả của dự án

Phân biệt theo chuỗi:

1. **Output/deliverable**: thứ dự án trực tiếp tạo ra, ví dụ source code, database migration, mobile app, API, documentation, deployed MVP.
2. **Product/service/result**: sản phẩm hoặc capability mà deliverable tạo nên, ví dụ nền tảng RosiHome cho landlord/tenant quản lý thuê phòng.
3. **Outcome**: thay đổi trực tiếp khi user dùng sản phẩm, ví dụ giảm thao tác tính tiền, payment record rõ hơn, maintenance có status.
4. **Benefit/impact**: lợi ích kinh doanh rộng hơn, ví dụ giảm administrative cost, giảm dispute, giảm vacancy và tăng visibility.

Deliverable có thể hoàn thành nhưng outcome/benefit chưa đạt nếu người dùng không adopt. Vì vậy pilot và feedback quan trọng.

#### Nguyên nhân chính khiến dự án phần mềm thất bại

- làm sai vấn đề hoặc giải quyết vấn đề không đủ giá trị;
- quản lý team, giao tiếp hoặc trách nhiệm không rõ;
- requirement/scope mơ hồ, scope creep;
- ước lượng time/cost/resources quá lạc quan;
- không kiểm chứng feasibility và technical risk sớm;
- phụ thuộc backend/frontend/dịch vụ ngoài nhưng không quản lý;
- phụ thuộc AI nhưng không human review;

#### Ràng buộc của dự án có ý nghĩa gì?

Constraint là giới hạn mà project manager phải tôn trọng khi ra quyết định. Các ràng buộc chính là scope, time, cost, quality, resources, risk, technology, stakeholder và pháp lý/privacy.

Với RosiHome:

- time: 8-10 tuần và lịch học;
- resources: 5 sinh viên part-time, 3 backend + 2 frontend;
- cost: budget tools/cloud/domain/contingency;
- scope: MVP và các exclusion;
- quality/security: auth, ownership, payment/lease consistency, tests;
- technology: mobile/web environment, PostgreSQL, external services;
- payment/legal: không giữ tiền, không automatic bank verification, không e-signature;
- adoption: landlord/tenant cần smartphone, internet và willingness to use.

### 2.10. Mẫu trả lời nhanh câu 1

> Nhóm hình thành Proposal từ pain point thực tế của chủ trọ tự quản lý 1-30 phòng. Nhóm phân tích current workflow, stakeholder, business case, các đối thủ như EasyTro, Resident, Quản lý trọ - CL Team và manual stack Excel/Zalo/calculator; sau đó xác định solution, feasibility, budget, time, risk và scope MVP. Proposal được đánh giá theo 10 tiêu chí gồm problem, stakeholder, solution, competitor, risk/vision, business benefit, customer discovery, feature/artifact, budget/timing và context/elevator pitch. Tài liệu nội bộ đánh giá khoảng 8.8-9.0/10 nhưng còn yếu ở customer discovery. Proposal cung cấp Why cho các tài liệu sau, được dùng để hình thành Vision/Scope, Charter, Backlog, Architecture, Estimate và Plan; chỉ cập nhật khi thay đổi ảnh hưởng baseline, còn detail kỹ thuật nhỏ quản lý ở backlog/PR. Trade-off chính là làm MVP nhẹ, không payment gateway và không AI để bảo đảm khả thi trong 8-10 tuần.

### 2.11. Bằng chứng nên in hoặc mở khi bị hỏi sâu

- `docs/proposal.md`: problem, business case, stakeholder, competitor, feasibility, budget, time, risk, high-level solution.
- `docs/proposal/business_case.md`: câu chuyện ông Tuấn và cách RosiHome giải quyết.
- `docs/proposal_evaluation/criteria.md`: 10 tiêu chí đánh giá.
- `docs/proposal_evaluation/conclusion.md`: nhận xét 8.8-9.0/10 và điểm yếu customer discovery.
- `docs/proposal/pain_point_and_problem.md`: evidence về pain point.
- `docs/proposal/feasibility.md`, `cost.md`, `budget.md`, `time.md`, `risks.md`, `stakeholders.md`.

## 3. Câu 2 - Project Vision and Scope

### 3.1. Câu mở đầu nên nói

> Project Vision and Scope trả lời **What should the project achieve and where are its boundaries?** Vision mô tả trạng thái mong muốn, giá trị và hướng phát triển; Scope biến vision thành các workflow, capability, feature và phần loại trừ có thể thực hiện trong một baseline cụ thể.

Proposal trả lời chủ yếu **Why**. Vision and Scope nối **Why** với **What**. 

### 3.2. Các câu hỏi chính tài liệu phải trả lời

- Hiện tại landlord và tenant đang làm gì, bằng công cụ nào, gặp vấn đề gì?
- User nào tham gia từng workflow và mục tiêu của họ là gì?
- Future workflow sau khi có RosiHome diễn ra theo bước nào?
- Hệ thống phải giải quyết pain point nào và kết quả cuối là gì?
- Những component/feature nào thuộc (in scope) và nằm ngoài (out scope) MVP ?
- Giải pháp khác đối thủ/manual process ở bước nào?
- Kế hoạch kinh doanh dự kiến và hướng mở rộng sau MVP là gì?

### 3.3. Quá trình nhóm hình thành Vision and Scope

#### Bước 1 - Đọc slide và xác định yêu cầu của tài liệu

Nhóm đọc slide/tài liệu môn học để hiểu Vision and Scope cần trình bày những nội dung nào. Sau đó nhóm gửi slide và yêu cầu tương ứng cho AI, thay vì chỉ yêu cầu AI viết một tài liệu vision chung chung.

#### Bước 2 - Dùng AI tạo bản nháp theo đúng format

Nhóm yêu cầu AI generate Vision and Scope document với các nội dung bắt buộc:

- **Current workflow:** landlord đang quản lý nhà trọ bằng công cụ thủ công hoặc các app rời rạc như notebook, Excel, calculator, Zalo và banking application; nêu user, các bước thực hiện, vấn đề và kết quả hiện tại.
- **Future workflow:** landlord và tenant sẽ tương tác với RosiHome như thế nào; hệ thống thay đổi các bước billing, payment, lease, maintenance và dashboard ra sao; kết quả sau cùng là gì.
- **Scope và features:** chuyển workflow thành các component/feature của MVP, đồng thời nêu các phần không làm.
- **Business strategy ngắn gọn:** RosiHome dự kiến kiếm tiền bằng các gói subscription hoặc các phương án thương mại phù hợp sau khi MVP được kiểm chứng.

#### Bước 3 - Dùng session/model khác để search và phản biện

Sau khi có bản nháp, nhóm cho một AI session khác hoặc một model khác **search extensively** và phản biện lại document. Mục đích là kiểm tra tài liệu có thiếu nội dung quan trọng, mô tả workflow có hợp lý, giải pháp có trùng hoặc mâu thuẫn với proposal, và phần scope/business strategy có phù hợp với dự án hay không.

#### Bước 4 - Thành viên kiểm chứng nội dung

Các thành viên đọc bản document đã generate và kiểm tra từng điểm:

1. Có đủ nội dung mà slide và yêu cầu môn học cần không?
2. Current workflow có đúng với cách landlord đang làm thủ công hoặc dùng các app rời rạc không?
3. Future workflow có đúng với cách team đang hình dung RosiHome hoạt động không?
4. Features có thực sự xuất phát từ workflow và pain point không?
5. Scope có vừa với MVP, team 5 người và thời gian dự kiến không?
6. Nội dung có đồng bộ với Proposal và không làm sai ý tưởng ban đầu không?

#### Bước 5 - Loop refine và chốt tài liệu

Khi thấy lỗi hoặc điểm chưa rõ, thành viên sửa tài liệu, tranh luận với nhau và tiếp tục chat với AI để hỏi, phản biện hoặc refine lại. Quy trình lặp nhiều lần cho đến khi team thống nhất rằng document đủ nội dung, đúng scope, đồng bộ với Proposal và phản ánh đúng workflow mà nhóm đang hình dung. AI hỗ trợ generate, search và critique; quyết định cuối cùng thuộc về cả team.

Sau khi chốt, current/future workflow trong tài liệu được dùng làm cơ sở để xác định feature, Product Backlog, acceptance criteria và các tài liệu planning tiếp theo.

### 3.4. Đầu vào của Vision and Scope

- `docs/proposal.md` ,slide tài liệu liên quan, mô tả tài liệu như thầy hướng dẫn trên lớp (doc gồm current workflow và future workflow) và nội dung vấn đáp giữa kì

### 3.5. Tài liệu được đánh giá thế nào?

1. **Completeness**: có background, current/future workflow, user problem/objective, component, exclusion, domain, assumption không.
2. **Consistency**: không mâu thuẫn với Proposal, Charter, Backlog, Architecture, SOW và Plan.
3. **Feasibility**: scope có vừa với 5 người, 8-10 tuần và budget không.
4. **Clarity**: landlord, tenant, system boundary và result của mỗi workflow có hiểu được không.
### 3.6. Đánh giá cụ thể với RosiHome

Tài liệu hiện có:
- current business use cases và future business use cases;
- current domain model và future domain model;
- component list cho MVP;
- excluded features có giải thích;
- assumptions và conclusion;
- intended business plan sau khi MVP được validate.

Các trade-off quan trọng:

- **MVP không AI** nhưng long-term vision có AI Landlord Assistant: AI là hướng phát triển sau, không được nói là capability đã cam kết trong MVP.
- **VietQR không phải payment gateway**: hệ thống tạo QR và lưu proof, không tự động xác nhận tiền từ ngân hàng.
- **Manual meter entry thay vì IoT**: phù hợp ngân sách và kỹ thuật hiện tại, nhưng phụ thuộc độ chính xác của landlord.
- **Small-landlord focus thay vì enterprise**: giảm complexity và setup effort, đổi lại chưa đáp ứng portfolio lớn.
- **Two-sided workflow thay vì landlord-only**: tenant cần account và adoption, nhưng đổi lại minh bạch và giảm dispute.

### 3.7. Vision and Scope được dùng và cập nhật như thế nào?

- để chuyển workflow thành Product Backlog/requirements.
- future state và domain model để viết architecture doc
- Team dùng in-scope/out-of-scope để quyết định scope ngay từ đầu, tránh scope creep
- future workflow để tạo end-to-end acceptance scenarios và test plan.

### 3.8. Mẫu trả lời nhanh câu 2

> Nhóm tạo Vision and Scope từ Proposal bằng cách mô hình hóa current state, future state và domain. Với RosiHome, nhóm bắt đầu từ ba current workflows của landlord/tenant, sau đó mô tả ba future workflows: billing/payment, lease/maintenance và portfolio monitoring. Từ các workflow đó nhóm chuyển thành feature components và Product Backlog, đồng thời chốt MVP và loại AI, payment gateway, e-signature, IoT, advanced accounting. Tài liệu được đánh giá bằng completeness, traceability từ pain point đến feature, consistency với Charter/Backlog/Architecture, feasibility, clarity, testability và change control. Trong lúc làm, tài liệu giúp viết backlog, architect thiết kế hệ thống, PM kiểm soát scope và tạo acceptance scenario. Vision dài hạn có thể là AI assistant nhưng đó là roadmap sau MVP; phải phân biệt với scope hiện tại.

### 3.9. Bằng chứng nên in hoặc mở

- `docs/vision_and_scope.md` phần current context, current/future use cases, current/future domain, process comparison, assumptions và risks.
- `docs/product_backlog_2.0.md` và `docs/product_backlog.md` để chứng minh workflow chuyển thành user story/acceptance criteria.
- `docs/architecture.md` để giải thích boundary và technical trade-off.
- `docs/project_charter.md` và `docs/statement_of_work.md` để chứng minh scope được baseline hóa.
- Giao diện hoặc flow billing/payment, lease/maintenance, dashboard nếu có bản in.

## 4. Câu 3 - Project Charter

### 4.1. Câu mở đầu nên nói

> Project Charter là tài liệu chính thức **ủy quyền khởi động dự án**, ghi nhận mục đích, mục tiêu cấp cao, phạm vi sơ bộ, stakeholder, vai trò, quyền quyết định, nguồn lực, milestone, assumption và governance. Charter trả lời dự án liên quan tới **các bên nào, các bên đó có nghĩa vụ, trách nhiệm gì, mỗi bên liên lạc như nào, có rủi ro liên quan gì**

### 4.2. Các câu hỏi chính Charter phải trả lời

- Dự án có những stakeholder nào? Mỗi stakeholder có vai trò, trách nhiệm, mức ảnh hưởng và rủi ro liên quan gì?
- Với từng stakeholder, nhóm liên hệ bằng kênh nào, ai là người liên hệ và khi có vấn đề thì escalation cho ai?
- Ai là Sponsor, PM, Product Owner, end user và người phê duyệt các quyết định quan trọng?
- Với từng backlog item/task/deliverable, ai là **Responsible**, **Accountable**, **Consulted** và **Informed**?
- Có thể truy ngược từ một task hoặc feature ra người chịu trách nhiệm và stakeholder liên quan không?

### 4.3. Quá trình nhóm hình thành Charter
#### Bước 1 - Đọc slide và xác định nội dung Charter cần có
Nhóm đọc slide/tài liệu môn học, note từ lớp học (note những cái thầy dặn về charter) để xác định Charter cần formalize dự án và làm rõ stakeholder, responsibility, authority, resources, milestones và governance. Nhóm không chỉ kiểm tra danh sách tên mà còn phải xác định mỗi stakeholder chịu trách nhiệm gì, liên hệ thế nào và có rủi ro nào.
#### Bước 2 - Cho AI đọc Proposal, Vision and Scope và Product Backlog để viết Charter theo format

Nhóm gửi Proposal, Vision and Scope, Product Backlog/Assignments và format Charter cho AI. AI đọc background, business case, stakeholders, current/future workflow, feature boundary, domain, exclusions và các task/backlog item để generate bản nháp Charter theo đúng format. Prompt yêu cầu tài liệu phải có:

- danh sách stakeholder và vai trò của từng bên;
- trách nhiệm, quyền quyết định và nghĩa vụ của từng stakeholder;
- người liên hệ, kênh liên hệ ;
- rủi ro hoặc dependency liên quan đến từng stakeholder;
- bảng RACI liên kết với backlog item, task;

#### Bước 3 - Dùng session/model khác để search và phản biện

Sau khi có bản nháp, nhóm cho một AI session khác hoặc model khác search extensively và phản biện lại document. Mục đích là kiểm tra có bỏ sót stakeholder, trách nhiệm, contact, risk, authority hoặc mapping giữa backlog và RACI hay không; đồng thời kiểm tra Charter có đồng bộ với Proposal, Vision and Scope và các tài liệu project khác không.

#### Bước 4 - Thành viên kiểm chứng và loop refine

Các thành viên đọc bản Charter đã generate và kiểm tra:

1. Danh sách stakeholder có đủ các bên tham gia hoặc bị ảnh hưởng không?
2. Mỗi stakeholder đã có responsibility, contact, communication và risk chưa?
3. Mỗi backlog item/task/deliverable đã có stakeholder liên quan trong RACI chưa?
4. Có truy ngược từ task ra Responsible/Accountable và contact được không?
5. Charter có nhất quán với backlog, assignments, Proposal và Vision and Scope không?
6. Scope có vừa với team 5 người và thời gian dự kiến không?

Khi thấy thiếu hoặc mâu thuẫn, team sửa tài liệu, tranh luận và tiếp tục chat với AI để phản biện/refine. Lặp lại đến khi Charter đủ nội dung, đúng authority và dùng được như baseline.

### 4.4. Đầu vào của Charter

| Đầu vào                     | Dùng để tạo phần nào của Charter                                                  |
| --------------------------- | --------------------------------------------------------------------------------- |
| Project Proposal            | Purpose, background, business case, high-level solution, preliminary constraints  |
| Vision and Scope            | Objectives, in/out scope, workflow, user và domain boundary                       |
| Stakeholder analysis        | Danh sách stakeholder, responsibility, contact, influence, risk và communication  |
| Product Backlog/Assignments | Workstream, task ownership, feature responsibility, stakeholder liên quan và RACI |
| Architecture                | Technical constraint, system boundary và technical owner                          |
| Project Plan/SOW            | Milestone, delivery batches, acceptance và governance                             |
| Academic requirements       | Lecturer authority, deadline, deliverables và evaluation context                  |

### 4.5. Charter được đánh giá thế nào?

#### Checklist đánh giá

- Danh sách stakeholder có đầy đủ người tham gia, người bị ảnh hưởng ?
- Mỗi stakeholder đã có role, responsibility, contact, communication channel, influence và risk chưa?
- Sponsor, PM và decision authority có rõ không?
- Mỗi backlog item/task/deliverable có stakeholder liên quan trong RACI không?
- Có thể truy ngược `task/feature → RACI → Responsible/Accountable → contact` không?
- Scope và mapping RACI có nhất quán với Vision/Scope, Backlog và Assignments không?

#### Đánh giá cụ thể RosiHome

Charter của RosiHome cần được giải thích chủ yếu như một baseline về stakeholder và responsibility: ai liên quan, họ chịu trách nhiệm gì, liên hệ thế nào, rủi ro/dependency ra sao và được mapping với backlog/task bằng RACI. Project Sponsor là University Supervisor/Lecturer; Chí là PM/Team Leader; team có 3 backend và 2 frontend; landlord representatives là Product Owner group; landlord/tenant là end users/pilot users. Điểm phải giải thích rõ là Chí vừa là PM vừa là BE1; đây là lựa chọn phù hợp team 5 người nhưng tạo risk workload/overload, nên cần shared documentation, delegation, review và theo dõi capacity.

### 4.6. Vì sao cần Charter?

1. Làm rõ stakeholder, trách nhiệm, quyền quyết định, cách liên hệ và rủi ro liên quan.
2. Tạo bảng RACI để mọi người hiểu ai Responsible, Accountable, Consulted và Informed.
3. Cho phép truy ngược từ task/feature/deliverable ra người chịu trách nhiệm và stakeholder cần liên hệ.
4. Tạo baseline để kiểm soát backlog, milestone, governance, risk, communication và change.
5. Khi backlog thay đổi, giúp xác định stakeholder nào cần thêm/xóa khỏi RACI và ai phải được thông báo.
6. Giúp xử lý tranh chấp dựa trên responsibility và authority đã thống nhất, thay vì dựa trên cảm nhận.

### 4.7. Charter được dùng và cập nhật như thế nào?

- dùng để xác nhận trách nhiệm của sponsor, PM và team.
- Khi thực thi: dùng để kiểm tra ownership, decision authority, contact, escalation và stakeholder liên quan đến deliverable.
- Khi backlog thêm/xóa item: thêm/xóa task/deliverable, stakeholder liên quan, owner và các ô RACI tương ứng; kiểm tra impact đến milestone và risk.
- Khi stakeholder, contact, responsibility hoặc risk thay đổi: cập nhật Charter và thông báo cho các bên bị ảnh hưởng.
- Khi kết thúc: dùng để kiểm tra deliverable, acceptance và trách nhiệm bàn giao.

Charter không nên bị sửa tùy tiện chỉ để làm cho kết quả thực tế “trông đúng kế hoạch”. Nếu baseline thay đổi, phải ghi lý do, impact, authority phê duyệt và phiên bản cập nhật.

### 4.8. Truy ngược từ task ra trách nhiệm

Charter được dùng để truy xuất hai chiều:

- **Từ task/feature ra người chịu trách nhiệm:** xác định backlog ID hoặc deliverable → tìm row tương ứng trong RACI → xác định Responsible/Accountable → xem contact channel và stakeholder risk liên quan.
- **Từ stakeholder ra công việc:** xác định stakeholder → liệt kê các row RACI mà họ giữ vai trò R/A/C/I → biết họ phải làm gì, được hỏi ý kiến ở đâu và cần được thông báo về thay đổi nào.

Nhờ đó, khi một task bị block, team biết phải liên hệ ai; khi backlog thay đổi, team biết chính xác row RACI và stakeholder nào cần cập nhật.


### 4.9. Mẫu trả lời nhanh câu 3

> Nhóm hình thành Charter tương tự Vision and Scope: đọc slide và các tài liệu đầu vào, dùng AI generate bản nháp theo format, dùng session/model khác search extensively và phản biện, sau đó cả team kiểm chứng và loop refine. Charter tập trung vào danh sách stakeholder, responsibility, contact, stakeholder risk và bảng RACI liên kết với backlog/task/deliverable. Với RosiHome, University Supervisor là Sponsor, Chí là PM/Team Leader, landlord representatives là Product Owner group, landlord/tenant là end users/pilot users. Charter giúp truy ngược từ task ra Responsible/Accountable và người cần liên hệ. Khi backlog thêm hoặc xóa item, nhóm cập nhật Charter và các stakeholder liên quan trong RACI, rồi kiểm tra lại milestone, risk và communication. Trade-off là Chí kiêm PM và BE1 giúp tiết kiệm resource nhưng tăng overload risk, nên cần shared documentation, review và theo dõi ownership.

### 4.10. Bằng chứng nên in hoặc mở

- `docs/project_charter.md`: danh sách stakeholder, role/responsibility, contact/communication, stakeholder risk, RACI, Purpose, Objectives, In/Out Scope, Governance, team, Facilities và Milestones.
- `docs/statement_of_work.md`: scope, deliverables, acceptance, batches, schedule, responsibilities và change control.
- `docs/assignments.md`: phân công feature/user story để đối chiếu với RACI và truy ngược task → owner.
- `docs/risk_management.md`: stakeholder risk, dependency, owner và response.
- `docs/project_plan.md`: batch sequence, dependency, roles, quality gates và communication.

## 5. Câu 21 - Lessons Learned Register và kiến thức quản lý dự án

### 5.1. Câu mở đầu nên nói

> Lessons Learned Register là một tài liệu sống ghi lại điều nhóm đã học được từ kinh nghiệm thực tế: chuyện gì xảy ra, nguyên nhân nào, tác động ra sao, điều gì làm tốt/chưa tốt, lần sau phải làm gì, ai chịu trách nhiệm áp dụng và bằng chứng ở đâu. Nó không chỉ là danh sách lỗi và cũng không phải Risk Register.

**Risk** nói về sự kiện chưa xảy ra có thể xảy ra trong tương lai. **Issue** là vấn đề đã xảy ra cần xử lý ngay. **Lesson learned** là tri thức rút ra sau khi quan sát kết quả, dùng để cải thiện quyết định hiện tại hoặc dự án sau.

### 5.2. Cấu trúc một Lessons Learned Register

Mỗi entry nên có:

| Trường | Ý nghĩa |
|---|---|
| ID, ngày, phase/batch | Biết lesson phát sinh ở đâu và khi nào |
| Situation/event | Chuyện thực tế đã xảy ra |
| Expected vs actual | Kế hoạch/giả định khác thực tế ở điểm nào |
| Impact | Ảnh hưởng tới scope, time, cost, quality, risk hoặc people |
| Root cause | Nguyên nhân, không chỉ triệu chứng |
| Lesson | Nhóm rút ra điều gì |
| Action/recommendation | Lần sau phải làm cụ thể gì |
| Owner/due date/status | Ai áp dụng, khi nào, đã áp dụng chưa |
| Evidence | Issue, PR, CI log, time log, Trello, meeting minutes, user feedback hoặc document |
| Validation | Sau khi áp dụng, kết quả có tốt hơn không |

### 5.3. Quá trình nhóm hình thành Lessons Learned Register

#### Bước 1 - Chuẩn bị template từ đầu

Không chờ đến cuối dự án mới nhớ lại. Tạo register ngay khi bắt đầu và thống nhất định nghĩa “lesson”, “issue”, “risk”, “action” và “evidence”.

#### Bước 2 - Thu thập dữ liệu liên tục

Nguồn dữ liệu của RosiHome có thể gồm:

- meeting note và quyết định của nhóm;
- Trello/GitHub board, issue, PR và review comment;
- CI/build/deployment log;
- test result và defect;
- time tracking, token report, cost report;
- estimate so với actual delivery;
- risk register và contingency đã kích hoạt;
- pilot/user feedback;
- thay đổi scope, schema/API hoặc external service;
- tài liệu bị sửa vì không đồng bộ với code.

#### Bước 3 - Ghi sự kiện trung tính

Ghi “Frontend bị chặn vì API contract chưa ổn định ở Batch X” thay vì ghi “BE làm chậm”. Ghi sự kiện, bằng chứng và tác động trước; nguyên nhân và trách nhiệm cần được thảo luận sau để tránh đổ lỗi cá nhân.

#### Bước 4 - Phân tích nguyên nhân và rút lesson

Hỏi: expected là gì, actual là gì, vì sao chênh lệch, chênh lệch gây hậu quả nào, điều gì có thể làm sớm hơn, và hành động nào có thể kiểm chứng.

#### Bước 5 - Review chéo và ưu tiên

Nhóm review entry trong batch review/retrospective. Lesson phải được team xác nhận, gắn owner, chuyển thành action trong backlog/plan/risk/quality process nếu cần.

#### Bước 6 - Áp dụng và kiểm chứng

Một lesson chỉ có giá trị khi hành động được áp dụng và có thể kiểm tra kết quả. Ví dụ: lesson “cần thống nhất API contract sớm” phải tạo contract review trước batch sau và kiểm tra xem số integration defect có giảm không.

#### Bước 7 - Đóng dự án

Cuối dự án, nhóm phân loại lessons theo people, process, product, technology, estimation, quality và stakeholder; chọn các lesson quan trọng để đưa vào quy trình/template của dự án sau.

### 5.4. Các lesson liên quan RosiHome

Bảng dưới đây là các entry có thể được dùng vì đã có dữ liệu hoặc rủi ro tương ứng trong repository. Khi nói “đã xảy ra”, chỉ dùng nếu nhóm có log/PR/meeting/pilot chứng minh. Nếu chưa có event thực tế, hãy gọi đúng là “preventive lesson/proposed lesson”, không biến risk thành lesson.

| Chủ đề | Lesson có thể nói | Hành động áp dụng | Bằng chứng hiện có / cần bổ sung |
|---|---|---|---|
| Estimation metrics | Không được trộn human effort, real time, cycle time, gross capacity và token thành một con số productivity duy nhất | Ghi rõ định nghĩa time; cập nhật estimate bằng actual và uncertainty factor | `docs/cost_time_resources/cost_time_resources_estimation_report.md`; cần time log gốc nếu bị hỏi |
| AI-assisted development | AI sinh code nhanh nhưng có thể sai logic/security; output phải qua acceptance criteria, test, human review và CI | PR approval, unit/integration/API test, ownership/authorization check | `docs/risk_management.md` RP-05; PR/CI/test result thực tế cần in |
| Scope control | Feature mới không được thêm âm thầm vì làm tăng time/cost/risk | Ghi backlog/future list; change request nếu ảnh hưởng baseline | `docs/project_plan.md`, `docs/statement_of_work.md`, RP-08; issue/change record cần bổ sung nếu đã có |
| Backend-frontend dependency | Frontend không nên đợi toàn bộ backend; cần API theo batch và shared UI chuẩn bị trước | Batch handoff, API contract và tích hợp từng batch | `docs/project_plan.md`, `docs/risk_management.md` RP-03; cần board/PR evidence |
| Database/schema | Nhiều backend cùng sửa schema dễ tạo merge/integration conflict | Thống nhất migration/schema trước, báo team, review affected owners | `docs/risk_management.md` RP-04; cần migration/PR/meeting evidence |
| Early feasibility | Công nghệ hoặc external service khó phải được thử sớm bằng vertical slice/PoC | Test auth/basic CRUD và critical integration trước khi commit scope lớn | `note.pdf` trang 6; cần link PoC/source/deploy nếu nhóm có |
| Free-tier dependency | AI/cloud/email/push quota hết có thể làm chậm hoặc tăng cash cost | Chuẩn bị fallback, theo dõi quota/expiry và giữ contingency | `docs/risk_management.md` RP-06/RP-10, estimate report |
| Documentation consistency | Tài liệu, code, acceptance và deployment phải cập nhật cùng nhau | Mỗi PR kiểm tra docs/config/migration/test evidence | `docs/project_plan.md` phần shared documentation; cần PR/commit minh họa |
| Customer discovery | Proposal tốt trên giấy vẫn chưa chứng minh willingness-to-pay nếu thiếu landlord interview thật | Tuyển pilot sớm, ghi interview/feedback, cập nhật assumption | `docs/proposal_evaluation/conclusion.md`; cần interview/survey/pilot evidence |
| PM overload | PM kiêm BE1 có lợi về coordination nhưng dễ thiếu thời gian quản lý | Chia sẻ ownership, định kỳ status, handover, review và capacity tracking | `docs/project_charter.md` role/risk; cần time report/meeting record |

### 5.5. Quản lý dự án là gì?

Project management là việc áp dụng kiến thức, kỹ năng, công cụ và kỹ thuật vào các hoạt động của project để đạt objective và deliverable trong các ràng buộc đã thống nhất. PM không chỉ là giao task; PM phải tạo alignment, ra quyết định, phối hợp dependency, dự báo và xử lý variance, quản lý stakeholder, quality, risk, change, communication và closing.

### 5.6. Vì sao cần quản lý khi phát triển phần mềm?

Phần mềm vô hình và khó đoán chính xác ngay từ đầu. Requirement có thể thay đổi, dependency kỹ thuật chồng chéo, nhiều người làm song song, lỗi phát hiện muộn sẽ đắt, external service có thể hỏng, và khách hàng chỉ biết mình cần gì sau khi thấy prototype/product. Quản lý giúp:

- xác định đúng vấn đề và outcome;
- phân rã công việc và ownership;
- lập baseline scope/time/cost/quality;
- phối hợp người, API, database, frontend, backend và deployment;
- phát hiện risk/issue/variance sớm;
- kiểm soát change và tránh scope creep;
- tạo bằng chứng chất lượng và acceptance;
- truyền đạt status/decision cho sponsor và team;
- lưu lại lessons để cải thiện.

### 5.7. Công việc quản lý và sản phẩm tương ứng

| Giai đoạn/công việc | Sản phẩm tương ứng trong RosiHome |
|---|---|
| Initiation: xác định problem, business value, stakeholder | Proposal, Business Case, Pain Point, Stakeholder Analysis |
| Vision/scope: xác định current/future state và boundary | Vision and Scope, current/future use cases, domain model |
| Authorization/governance | Project Charter, RACI, decision authority |
| Requirements | Product Backlog, user stories, acceptance criteria |
| Technical planning | Architecture, API/data contracts, Prototype/PoC nếu có |
| Process planning | Project Plan, development method, batch/workflow, communication plan |
| Estimate/resource/cost | Project Estimation, cost-time-resources report, budget, resource baseline |
| Agreement/acceptance | Statement of Work, deliverables, acceptance conditions, change control |
| Risk/quality/test planning | Risk Management Plan, quality/test plan, Definition of Done, test evidence |
| Execution | Source code, database migrations, tests, documentation, deployed modules |
| Monitoring/reporting | Trello/GitHub board, time/token/cost report, status report, burndown/flow data |
| Change control | Change request, impact analysis, approval, updated backlog/plan/docs |
| Closing/learning | Acceptance/demo, deployment revision, archive, Lessons Learned Register |

### 5.8. Có cần một người chỉ chuyên tâm làm quản lý không?

Không phải dự án nào cũng cần một full-time dedicated PM, nhưng mọi dự án đều cần **management responsibility**.

- Với team nhỏ, scope nhỏ, thời gian ngắn và mọi người có thể giao tiếp trực tiếp, một member có thể kiêm PM và developer. RosiHome đang dùng cách này: Chí là PM/Team Leader và BE1.
- Trade-off là tiết kiệm resource và PM hiểu kỹ thuật, nhưng dễ overload, bỏ sót coordination hoặc ưu tiên code của mình.
- Cần giảm risk bằng RACI, shared documentation, review chéo, status cadence, explicit decision owner và capacity/time tracking.
- Với dự án lớn, nhiều team, nhiều vendor, nhiều stakeholder, deadline nghiêm ngặt hoặc risk cao thì nên có PM chuyên trách; developer không nên tự quản lý toàn bộ mà không có coordination capacity.

### 5.9. Plan-driven và adaptive/empirical management

#### Điểm giống

Cả hai đều cần mục tiêu, stakeholder, scope, resource, risk, quality, communication, monitoring và decision. Adaptive không có nghĩa là không lập kế hoạch; nó lập kế hoạch ngắn hơn và cập nhật dựa trên feedback.

#### Plan-driven/predictive

- lập scope, schedule và plan tương đối chi tiết từ đầu;
- thay đổi qua formal change control;
- phù hợp requirement ổn định, compliance cao, deliverable dễ xác định;
- ưu điểm: dễ dự báo, baseline và contract rõ;
- nhược điểm: estimate sớm dễ sai, feedback đến muộn, thay đổi đắt và có thể làm team bám plan sai.

#### Adaptive/empirical

- làm theo iteration/batch/flow ngắn, tạo increment/deployable result;
- quan sát actual data và feedback rồi điều chỉnh priority/scope;
- phù hợp requirement chưa chắc chắn, cần học từ user và kỹ thuật;
- ưu điểm: feedback sớm, phát hiện risk sớm, linh hoạt;
- nhược điểm: khó chốt total cost/date nếu scope không kiểm soát, cần stakeholder feedback và kỷ luật WIP.

#### RosiHome dùng cách nào?

RosiHome là **hybrid**:

- có predictive baseline: academic deadline 8-10 tuần, scope MVP, deliverables, SOW, milestones, roles và change control;
- có adaptive execution: backend/frontend làm theo 4 batches, tích hợp từng batch, dùng actual time/token/deployment data để refine estimate, ưu tiên pilot feedback;
- workflow gần Kanban: board, WIP, trạng thái, cycle time và successful deployment là output quan sát được; không nên gọi là Scrum thuần nếu nhóm không có sprint timebox/ceremony đúng nghĩa.

### 5.10. Quan hệ giữa Project Management và Software Engineering

Software Engineering tạo ra sản phẩm đúng về kỹ thuật: requirements, architecture, design, code, test, deployment và maintenance. Project Management tạo điều kiện để công việc đó được làm đúng mục tiêu, đúng ưu tiên, đúng resource, đúng thời gian và có stakeholder alignment.

Hai bên phụ thuộc lẫn nhau:

- PM cần technical estimate, dependency và risk từ engineering để lập plan thực tế.
- Engineering cần scope, priority, decision và resource do PM/PO điều phối.
- Quality không chỉ là test cuối; PM cần đưa review, CI, Definition of Done và acceptance vào process.
- Khi technical feasibility thay đổi, engineer phải báo PM để re-estimate/change control; PM không được ép deadline bằng cách che giấu risk.
- Khi stakeholder đổi yêu cầu, PM kiểm soát impact; engineer đánh giá cách triển khai và trade-off.

Nói ngắn: Software Engineering trả lời “xây đúng và xây tốt như thế nào”; Project Management bảo đảm nhóm đang xây đúng thứ cần xây và có thể hoàn thành trong điều kiện thực tế.

### 5.11. Vì sao công ty lớn cần PMO?

PMO (Project Management Office) là bộ phận hỗ trợ, kiểm soát hoặc trực tiếp quản lý hoạt động project ở cấp tổ chức. Công ty lớn cần PMO vì có nhiều project cùng lúc, nhiều team/vendor, tài nguyên dùng chung, rủi ro liên quan và cần quyết định theo portfolio thay vì từng project riêng lẻ.

PMO có thể:

- cung cấp template, standard, methodology, training và governance;
- chuẩn hóa cách lập estimate, status, risk, quality, change và lessons learned;
- tổng hợp dashboard về scope/time/cost/resource/risk giữa các project;
- hỗ trợ ưu tiên portfolio theo chiến lược và benefit;
- điều phối resource dùng chung và dependency liên project;
- kiểm tra compliance, audit và stage-gate;
- lưu knowledge base để lesson của một project dùng cho project khác;
- hỗ trợ sponsor và PM ra quyết định.

Có thể phân biệt:

- **Supportive PMO**: tư vấn, template, training; quyền kiểm soát thấp.
- **Controlling PMO**: yêu cầu tuân thủ standard và báo cáo; quyền kiểm soát vừa.
- **Directive PMO**: trực tiếp cung cấp PM và quản lý project; quyền kiểm soát cao.

PMO không phải lý do để mọi team nhỏ phải tạo thêm bureaucracy. RosiHome chưa cần PMO riêng; nhóm cần các cơ chế PMO-lite như template, RACI, risk register, status report, quality gates, change control và lessons register.

### 5.12. Đánh giá Lessons Learned Register

Đánh giá theo các câu hỏi:

1. Entry có dựa trên một event thật và có evidence không?
2. Có phân biệt fact, interpretation, risk và opinion không?
3. Có phân tích root cause và impact đủ cụ thể không?
4. Lesson có actionable không, hay chỉ là “lần sau phải cẩn thận hơn”?
5. Có owner, deadline, status và cách kiểm chứng không?
6. Action đã được đưa vào backlog, plan, template, policy hoặc checklist chưa?
7. Có review chéo để tránh đổ lỗi cá nhân và tránh trùng lặp không?
8. Có theo dõi lesson đã tạo cải thiện thật hay chưa không?
9. Có bao phủ cả positive và negative lessons không?
10. Có cập nhật xuyên suốt project thay vì viết hồi tưởng không?

### 5.13. Mẫu trả lời nhanh câu 21

> Nhóm tạo Lessons Learned Register như một tài liệu sống, thu thập từ meeting, board, PR/CI, test, deployment, time/token report, risk, estimate và feedback. Mỗi entry ghi event, expected/actual, impact, root cause, lesson, action, owner, status và evidence. Sau mỗi batch nhóm review chéo, chuyển action thành thay đổi cụ thể trong backlog, plan, test, policy hoặc template; cuối project tổng hợp và áp dụng cho project sau. Với RosiHome, các bài học quan trọng cần kiểm chứng là phải tách human effort với real time/token, AI code phải human-review/test, cần scope control, API/schema contract sớm, fallback cho free-tier/external service và tuyển pilot sớm. Project management là việc áp dụng knowledge/skills/tools để đạt objective trong ràng buộc; nó cần vì software phức tạp, thay đổi và có nhiều dependency. Team nhỏ không nhất thiết cần PM full-time nhưng phải có người chịu trách nhiệm; RosiHome để Chí kiêm PM/BE1 và giảm overload bằng RACI/review/documentation. RosiHome dùng hybrid giữa baseline plan-driven và adaptive batch/Kanban. PM phối hợp với Software Engineering qua requirements, estimate, architecture, quality, risk và change. Công ty lớn cần PMO để chuẩn hóa governance, điều phối resource/dependency, theo dõi portfolio và lưu knowledge.

## 6. Các điểm phải kiểm tra trước khi in và nói trong phòng thi

### 6.1. Chưa có Lessons Learned Register riêng

Hiện repository chưa có file `docs/lessons_learned_register.md`. Đề thi yêu cầu nộp bản in tài liệu này cho câu 21. Trước khi thi, nhóm nên tạo register thật từ issue/PR/meeting/time log/pilot feedback và điền ID, ngày, người phụ trách, action, status, evidence. Không nên chỉ in phần đề cương này rồi gọi đó là register.

### 6.2. Không biến risk thành lesson

`docs/risk_management.md` ghi risk và mitigation, nhưng risk chưa chắc đã là lesson. Nếu chưa có sự kiện thực tế, nói “nhóm dự đoán/đề xuất preventive action”. Chỉ nói “nhóm đã học được” khi có actual event và bằng chứng.

### 6.3. Cẩn thận với số budget

Các tài liệu có nhiều mức estimate theo các thời điểm khác nhau:

- Proposal seed budget: 4,250,000 VND cho build/pilot 8-10 tuần.
- SOW/estimation baseline expected: khoảng 3,277,500 VND, range 950,000-4,062,500 VND.

Nếu bị hỏi, giải thích đây là preliminary sponsor-facing budget và evidence-based project estimate được refine sau khi có delivery inputs; phải chỉ rõ tài liệu/phiên bản, không gộp thành một con số duy nhất.

### 6.4. Cẩn thận với AI và long-term vision

MVP hiện tại loại AI analytics. AI Landlord Assistant và Rental Benchmark Data là hướng phát triển dài hạn, không được trình bày như tính năng MVP đã hoàn thành. Tương tự, “VietQR” không đồng nghĩa với automatic payment gateway hoặc bank reconciliation.

### 6.5. Cẩn thận với time, effort, cycle time và token

Khi nói estimate, phải nêu rõ:

- **Duration/cycle time**: thời gian lịch từ start đến done/deployed.
- **Effort**: công sức của người, thường person-hours/person-days.
- **Real time**: thời gian triển khai được thành viên ghi nhận, có thể bao gồm AI-assisted work.
- **Gross capacity**: tổng khả năng sẵn sàng của team.
- **Size**: story points, SLOC, function points hoặc số feature; không phải time.
- **Token**: chỉ là AI resource indicator, không tự động bằng tiền lương hay API invoice.

### 6.6. Không nói quá mức bằng chứng customer

Proposal evaluation đã chỉ ra customer discovery là điểm yếu. Nếu nhóm chưa có phỏng vấn/survey/pilot thật, nói “assumption cần validate”, không nói “đã chứng minh product-market fit”. Đây là điểm dễ bị hỏi ngược.

### 6.7. Câu chốt nếu bị hỏi “tài liệu có thật sự được dùng không?”

> Có. Nhóm không xem tài liệu là sản phẩm viết cho đủ hồ sơ. Proposal cung cấp Why; Vision and Scope cung cấp What và boundary; Charter cung cấp authority và responsibility; Backlog chuyển workflow thành work; Architecture quyết định How; Plan/Estimate/SOW/Risk điều phối delivery. Khi code, test, deploy hoặc pilot phát hiện thông tin mới, nhóm cập nhật artifact liên quan qua board, PR, issue hoặc change control. Mức độ cập nhật phải được đối chiếu bằng commit, PR, board và bản deploy chứ không chỉ bằng lời nói.

## 7. Câu thần chú 30 giây trước khi trả lời

**Proposal = Why.**

**Vision and Scope = What và boundary.**

**Charter = Who, authority và governance.**

**Lessons Learned = What happened, why, what we change next.**

Với mọi câu, luôn nối lại bằng công thức:

> RosiHome giải quyết pain point nào -> nhóm đã tạo tài liệu bằng dữ liệu nào -> đã chọn trade-off gì -> dùng artifact nào để kiểm tra -> tài liệu ảnh hưởng quyết định nào -> bằng chứng thực tế nằm ở đâu.
