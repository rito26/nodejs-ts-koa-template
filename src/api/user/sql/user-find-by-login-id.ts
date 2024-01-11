export default
`
    SELECT
           user_idx
          ,login_id
          ,nickname
          ,user_role

      FROM user_info

     WHERE login_id = {loginId}
       AND deleted_at IS NULL
`;