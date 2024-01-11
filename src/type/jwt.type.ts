
/**
 * JWT 페이로드
 */
export type JwtBody = {
    
    iat: number;
    exp: number;

    [key: string]: any;
}

/**
 * JWT 데이터 해석한 메타데이터
 */
export type JwtMeta = {
    
    issuedAt: Date;
    expiredAt: Date;
}