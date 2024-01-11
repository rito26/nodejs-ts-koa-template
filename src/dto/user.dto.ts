import { swaggerClass, swaggerProperty } from "koa-swagger-decorator";


@swaggerClass()
export class subObject {
  @swaggerProperty({ type: "string", required: true }) Email: string = "";
  @swaggerProperty({ type: "string", required: true }) NickName: string = "";
  @swaggerProperty({ type: "string", required: true }) Password: string = "";
}