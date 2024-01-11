export default
`
    INSERT INTO user_info
    (
        login_id,
        nickname,
        pwd
    )
    VALUES
    (
        {loginId},
        {nickname},
        {pwd}
    )
    RETURNING user_idx
`;