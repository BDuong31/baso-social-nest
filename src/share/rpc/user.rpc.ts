import { Injectable } from "@nestjs/common";
import axios from "axios";
import { IPublicUserRpc, PublicUser } from "..";


// Khởi tạo client cho việc giao tiếp với user service
@Injectable()
export class UserRPCClient implements IPublicUserRpc {
  constructor(private readonly userServiceUrl: string) { }

  // Tìm người dùng theo id
  async findById(id: string): Promise<PublicUser | null> {
    try {

      // Gửi request lên user service
      const { data } = await axios.get(`${this.userServiceUrl}/rpc/users/${id}`);
      const user = data.data;
      return {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        followerCount: user.followerCount,
        postCount: user.postCount,
      } as PublicUser;
    } catch (error) {
      return null;
    }
  }

  // Tìm người dùng theo danh sách id
  async findByIds(ids: Array<string>): Promise<Array<PublicUser>> {
    
    // Gửi request lên user service
    const { data } = await axios.post(`${this.userServiceUrl}/rpc/users/list-by-ids`, { ids });

    // Chuyển đổi dữ liệu trả về
    const users = data.data.map((user: any) => {
      return {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        followerCount: user.followerCount,
        postCount: user.postCount,
      } as PublicUser;
    });

    return users;
  }

  // Cập nhật thông tin người dùng
  async updateAuthorRpc(id: string, dto: any): Promise<boolean> {
    console.log('id', id);
    console.log('dto', dto);
    
    // Gửi request lên user service
    const { data } = await axios.patch(`${this.userServiceUrl}/rpc/users/${id}`, dto);
    console.log('data', data);
    return data.data;
  }
}