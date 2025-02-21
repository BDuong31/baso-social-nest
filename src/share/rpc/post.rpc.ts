import { Injectable } from "@nestjs/common";
import axios from "axios";
import { IPostRpc, Post } from "..";

// Khởi tạo client cho việc giao tiếp với post service
@Injectable()
export class PostRPCClient implements IPostRpc {
  constructor(private readonly postServiceUrl: string) { }

  // Hàm lấy thông tin post theo id
  async findById(id: string): Promise<Post | null> {
    try {

      // Gửi request lên post service
      const { data } = await axios.get(`${this.postServiceUrl}/posts/rpc/posts/${id}`);
      if (data) return data.data;
      return null;
    } catch (error) {
      return null;
    }
  }

  // Hàm lấy thông tin post theo danh sách id
  async findByIds(ids: Array<string>): Promise<Array<Post>> {
    try {

      // Gửi request lên post service
      const { data } = await axios.post(`${this.postServiceUrl}/posts/rpc/posts/list-by-ids`, { ids });
      return data.data;

    } catch (error) {
      return [];
    }
  }
}