import { Injectable } from "@nestjs/common";
import { User as UserPrisma } from "@prisma/client";
import { UserRole } from "src/share";
import prisma from "src/share/components/prisma";
import { UserCondDTO, UserUpdateDTO } from "./user.dto";
import { Status, User } from "./user.model";
import { IUserRepository } from "./user.port";

// Lớp UserPrismaRepository cung cấp các phương thức truy vấn dữ liệu từ Prisma
@Injectable()
export class UserPrismaRepository implements IUserRepository {
  
  // Lấy thông tin người dùng theo id hoặc username
  async get(id: string): Promise<User | null> {

    // Gửi request lên user service
    const data = await prisma.user.findFirst({ where: { OR: [{ id: id},  {username: id}] } });
    if (!data) return null;

    return this._toModel(data);
  }

  // Lấy thông tin người dùng theo điều kiện
  async findByCond(cond: UserCondDTO): Promise<User | null> {
    const data = await prisma.user.findFirst({ where: cond });
    if (!data) return null;

    return this._toModel(data);
  }

  // Thêm người dùng mới
  async insert(user: User): Promise<void> {
    await prisma.user.create({ data: user });
  }

  // Lấy danh sách người dùng theo danh sách id
  async listByIds(ids: string[]): Promise<User[]> {
    const data = await prisma.user.findMany({ where: { id: { in: ids } } });
    return data.map(this._toModel);
  }

  // Cập nhật thông tin người dùng
  async update(id: string, dto: UserUpdateDTO): Promise<void> {
    await prisma.user.update({ where: { id }, data: dto });
  }

  // Xóa người dùng
  async delete(id: string, isHard: boolean): Promise<void> {
    (isHard) ? 
      await prisma.user.delete({ where: { id } }) :
      await prisma.user.update({ where: { id }, data: { status: Status.DELETED } });
  }

  // Chuyển đổi dữ liệu từ Prisma sang User
  private _toModel(data: UserPrisma): User {
    return { ...data, role: data.role as UserRole } as User;
  }
}
