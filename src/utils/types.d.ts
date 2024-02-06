import { SEX } from './constant';

export interface ISimpleUser {
  id: number;
  realName: string;
  roleId: number;
  roleName: string;
  loginName: string;
  avatar: string;
  deptName: string;
  deptId: number;
  sex: SEX;
}

export interface TestCase {
  input: string;
  output: string;
}

export class difficultyComposition {
  easy: number;
  medium: number;
  hard: number;
}
