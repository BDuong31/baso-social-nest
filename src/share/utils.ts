import { Paginated } from "./data-model";

// Hàm tạo phản hồi phân trang
export const paginatedResponse = <E>(paginated: Paginated<E>, filter: any) => ({
  data: paginated.data, // Dữ liệu phân trang
  paging: paginated.paging, // Thông tin phân trang
  total: paginated.total, // Tổng số trang
  filter, // Bộ lọc
});
