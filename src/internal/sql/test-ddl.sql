DROP TABLE IF EXISTS user_info CASCADE;
CREATE TABLE user_info
(
     user_idx     SERIAL                         PRIMARY KEY
    ,login_id     VARCHAR(100)    NOT NULL       UNIQUE
    ,nickname     VARCHAR(100)    NOT NULL       UNIQUE
    ,pwd          VARCHAR(100)    NOT NULL
    ,pwd_salt     VARCHAR(100)    NOT NULL       DEFAULT ('SALT_DEF')
    ,user_role    VARCHAR(50)     NOT NULL       DEFAULT ('user')

    ,CHECK (user_role IN ('user', 'admin'))
);
CALL SET_SERIAL_TO_AUTO_INCREMENT('user_info', 'user_idx');
CALL ADD_TABLE_TIME_COLS('user_info');

INSERT INTO user_info (login_id, nickname, pwd) VALUES
('user0123', '유저0123', '1q2w3e4r!'),
('dogdog2', '멍멍2', '1234!'),
('catcat3', '고먐미', '1111!'),
('aooooong4', '애옹이', '0000!');

------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS user_detail;
CREATE TABLE user_detail
(
     user_idx           INT             PRIMARY KEY    REFERENCES user_info(user_idx)
    ,user_login_type    VARCHAR(100)    NOT NULL       DEFAULT 'default'
    
    ,CHECK (user_login_type IN ('default', 'google'))
);
CALL ADD_TABLE_TIME_COLS('user_detail');

INSERT INTO user_detail (user_idx, user_login_type) VALUES
(1, 'default');

