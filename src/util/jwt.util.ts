import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { JwtBody, JwtMeta } from "../type/jwt.type";

export class JwtUtil {

    /**
     * 토큰 페이로드 복원
     */
    public static Decode(encodedJwt: string) : { body: JwtBody, meta: JwtMeta} | undefined {

        try {
            const ejwt = encodedJwt.replace(/^[Bb]earer\s/, "");
            const decoded = jwt.decode(ejwt) as JwtBody;
            const meta : JwtMeta = {
                issuedAt : decoded["iat"] ? new Date(decoded["iat"] * 1000) : undefined,
                expiredAt: decoded["exp"] ? new Date(decoded["exp"] * 1000) : undefined,
            };
            return {
                body: decoded,
                meta
            };
        }
        catch {
            return undefined;
        }
    }

    // TODO: 리프레시 토큰 발급
}