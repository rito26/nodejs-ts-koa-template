export default
`
    DELETE FROM user_info
     WHERE user_idx = {userIdx}
       AND deleted_at IS NULL
`;