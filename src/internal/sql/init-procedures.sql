-- ---------------------------------------------------------------------------------------------
-- Serial 컬럼용 트리거 함수
-- - Serial을 AUTO_INCREMENT로 만들어준다.
-- - 사용법 : 
-- CREATE TRIGGER {트리거명} AFTER INSERT OR UPDATE OR DELETE ON {테이블명} FOR EACH ROW 
-- EXECUTE PROCEDURE TRIGGER_READJUST_SERIAL('{테이블명}', '{컬럼명}');
-- ---------------------------------------------------------------------------------------------
-- DROP FUNCTION IF EXISTS TRIGGER_READJUST_SERIAL;
CREATE OR REPLACE FUNCTION TRIGGER_READJUST_SERIAL()
RETURNS TRIGGER AS $$
    DECLARE maxVal INT;
    DECLARE _tabName TEXT;
    DECLARE _colName TEXT;
BEGIN
    _tabName := TG_ARGV[0];
    _colName := TG_ARGV[1];
    
    EXECUTE(FORMAT('SELECT COALESCE(MAX(%s), 0) + 1 FROM %s;', _colName, _tabName)) INTO maxVal;
    EXECUTE(FORMAT('ALTER SEQUENCE %s_%s_SEQ RESTART WITH %s;', _tabName, _colName, maxVal));
    RETURN NEW;
END; $$
LANGUAGE 'plpgsql';

-- ---------------------------------------------------------------------------------------------
-- Serial 컬럼용 트리거 함수 - Serial 시퀀스 값을 1로 리셋한다.
-- ---------------------------------------------------------------------------------------------
-- DROP FUNCTION IF EXISTS TRIGGER_RESET_SERIAL;
CREATE OR REPLACE FUNCTION TRIGGER_RESET_SERIAL()
RETURNS TRIGGER AS $$
    DECLARE _tabName TEXT;
    DECLARE _colName TEXT;
BEGIN
    _tabName := TG_ARGV[0];
    _colName := TG_ARGV[1];
    
    EXECUTE(FORMAT('ALTER SEQUENCE %s_%s_SEQ RESTART WITH 1;', _tabName, _colName));
    RETURN NEW;
END; $$
LANGUAGE 'plpgsql';

-- ---------------------------------------------------------------------------------------------
-- Serial 컬럼용 트리거 함수 간편 생성 프로시저
-- - Serial을 AUTO_INCREMENT로 만들어준다.
-- - 사용법 : 
-- CALL SET_SERIAL_TO_AUTO_INCREMENT('{테이블명}', '{컬럼명}');
-- ---------------------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS SET_SERIAL_TO_AUTO_INCREMENT;
CREATE PROCEDURE SET_SERIAL_TO_AUTO_INCREMENT 
(
    _tabName TEXT
   ,_colName TEXT
)
AS $$
    DECLARE _trgName1 TEXT;
    DECLARE _trgName2 TEXT;
BEGIN
    _trgName1 := 'TRG' || '_' || _tabName || '_' || _colName || '_EACH';
    _trgName2 := 'TRG' || '_' || _tabName || '_' || _colName || '_RESET';
    
    EXECUTE(FORMAT('CREATE TRIGGER %s AFTER INSERT OR UPDATE OF %s OR DELETE ON %s FOR EACH ROW EXECUTE PROCEDURE TRIGGER_READJUST_SERIAL(''%s'', ''%s'');',
                   REPLACE(_trgName1, '.', '_'), _colName, _tabName, _tabName, _colName));
    
    EXECUTE(FORMAT('CREATE TRIGGER %s AFTER TRUNCATE ON %s EXECUTE PROCEDURE TRIGGER_RESET_SERIAL(''%s'', ''%s'');',
                   REPLACE(_trgName2, '.', '_'),           _tabName, _tabName, _colName));
END; $$
LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------------------------
-- AUTO_INCREMENT 컬럼을 테이블에 간편히 추가
-- CALL ADD_AUTO_INCREMENT_COLUMN_TO_TABLE('{테이블명}', '{컬럼명}');
-- ---------------------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS ADD_AUTO_INCREMENT_COLUMN_TO_TABLE;
CREATE PROCEDURE ADD_AUTO_INCREMENT_COLUMN_TO_TABLE 
(
    _tabName TEXT
   ,_colName TEXT
)
AS $$
BEGIN
    EXECUTE(FORMAT('ALTER TABLE %s ADD COLUMN %s SERIAL;', _tabName, _colName));
    CALL SET_SERIAL_TO_AUTO_INCREMENT(_tabName, _colName);
END; $$
LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------------------------
-- 대상 테이블에 CREATED_AT 컬럼 추가
-- ---------------------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS ADD_CRT_ON_TABLE;
CREATE PROCEDURE ADD_CRT_ON_TABLE
(
    _tableName TEXT,
    _created_at TEXT default 'CREATED_AT'
)
AS $$
    DECLARE _fullName TEXT;
BEGIN

    _fullName := REPLACE(_tableName, '.', '_'); -- 테이블명에 스키마가 포함된 경우, 점 치환
    
    EXECUTE FORMAT('ALTER TABLE %s ADD COLUMN %s TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP', _tableName, _created_at);
    EXECUTE FORMAT('CREATE INDEX IDX_%s_%s ON %s USING BRIN (%s)', _fullName, _created_at, _tableName, _created_at);
    
END; $$
LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------------------------
-- 대상 테이블에 CREATED_AT, UPDATED_AT 컬럼 추가
-- ---------------------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS ADD_CRT_UPT_ON_TABLE;
CREATE PROCEDURE ADD_CRT_UPT_ON_TABLE
(
    _tableName TEXT,
    _created_at TEXT default 'CREATED_AT',
    _updated_at TEXT default 'UPDATED_AT'
)
AS $$
    DECLARE _fullName TEXT;
BEGIN

    _fullName := REPLACE(_tableName, '.', '_'); -- 테이블명에 스키마가 포함된 경우, 점 치환
    
    EXECUTE FORMAT(
        'CREATE OR REPLACE FUNCTION AUTO_UPDATE__%s() '
        '    RETURNS TRIGGER AS $_$ '
        'BEGIN '
        '    NEW.%s = now(); '
        '    RETURN NEW; '
        'END; $_$ '
        'LANGUAGE ''plpgsql'';'
    , _updated_at, _updated_at);
    
    EXECUTE FORMAT('ALTER TABLE %s ADD COLUMN %s TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP', _tableName, _created_at);
    EXECUTE FORMAT('ALTER TABLE %s ADD COLUMN %s TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP', _tableName, _updated_at);
    
    EXECUTE FORMAT('CREATE TRIGGER %s BEFORE UPDATE ON %s FOR EACH ROW EXECUTE PROCEDURE AUTO_UPDATE__%s()', _updated_at, _tableName, _updated_at);
    EXECUTE FORMAT('CREATE INDEX IDX_%s_%s ON %s USING BRIN (%s)', _fullName, _created_at, _tableName, _created_at);
    EXECUTE FORMAT('CREATE INDEX IDX_%s_%s ON %s USING BRIN (%s)', _fullName, _updated_at, _tableName, _updated_at);
    
END; $$
LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------------------------
-- 대상 테이블에 DELETED_AT 컬럼 추가 + Soft Delete (Hard Delete 방지)
-- ---------------------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS ADD_DLT_ON_TABLE;
CREATE PROCEDURE ADD_DLT_ON_TABLE
(
    _tableName TEXT,
    _deleted_at TEXT default 'DELETED_AT',
    _makeSoftDelete BOOLEAN default TRUE
)
AS $$
    DECLARE _fullName TEXT;
BEGIN

    _fullName := REPLACE(_tableName, '.', '_'); -- 테이블명에 스키마가 포함된 경우, 점 치환
    
    -- 1. deleted_at 컬럼 추가
    EXECUTE FORMAT('ALTER TABLE %s ADD COLUMN %s TIMESTAMPTZ NULL DEFAULT NULL', _tableName, _deleted_at);
    EXECUTE FORMAT('CREATE INDEX IDX_%s_%s ON %s USING BRIN (%s)', _fullName, _deleted_at, _tableName, _deleted_at);

    -- 2. Soft delete 강제
    IF _makeSoftDelete = TRUE THEN
        EXECUTE FORMAT(
            'CREATE OR REPLACE FUNCTION TRIGGER_SOFT_DELETE_%s() '
            'RETURNS trigger AS '' BEGIN UPDATE %s SET %s = NOW() WHERE ctid=OLD.ctid; RETURN NULL; END; '' language plpgsql;'
        , _fullName, _tableName, _deleted_at);
        
        EXECUTE FORMAT('CREATE TRIGGER SOFT_DEL_%s BEFORE DELETE ON %s FOR EACH ROW EXECUTE PROCEDURE TRIGGER_SOFT_DELETE_%s();'
        ,_fullName, _tableName, _fullName);
    END IF;
    
END; $$
LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------------------------
-- 대상 테이블에 CREATED_AT, UPDATED_AT DELETED_AT 컬럼 추가 + Soft Delete 설정
-- ---------------------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS ADD_TABLE_TIME_COLS;
CREATE PROCEDURE ADD_TABLE_TIME_COLS
(
    _tableName TEXT,
    _created_at TEXT default 'CREATED_AT',
    _updated_at TEXT default 'UPDATED_AT',
    _deleted_at TEXT default 'DELETED_AT',
    _makeSoftDelete BOOLEAN default TRUE
)
AS $$
BEGIN

    CALL ADD_CRT_UPT_ON_TABLE(_tableName, _created_at, _updated_at);
    CALL ADD_DLT_ON_TABLE(_tableName, _deleted_at, _makeSoftDelete);
    
END; $$
LANGUAGE plpgsql;