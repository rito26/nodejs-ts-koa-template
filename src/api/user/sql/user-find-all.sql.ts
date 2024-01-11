export default
`
    SELECT
           user_idx
          ,login_id
          ,nickname
          ,user_role

      FROM user_info

     WHERE deleted_at IS NULL
`;