DROP TABLE IF EXISTS brgy_info;
CREATE TABLE IF NOT EXISTS brgy_info (
id INT,
brgy_num INT,
brgy_name VARCHAR(64),
brgy_address1 VARCHAR(255),
brgy_address2 VARCHAR(255),
brgy_district VARCHAR(255),
brgy_city VARCHAR(255),
brgy_postal_code VARCHAR(4),
brgy_email VARCHAR(255),
brgy_hotline_no VARCHAR(12),
brgy_landline1 VARCHAR(12),
brgy_landline2 VARCHAR(12),
brgy_mobile1 VARCHAR(12),
brgy_mobile2 VARCHAR(12),
brgy_intro VARCHAR(64),
brgy_mission VARCHAR(512),
brgy_vision VARCHAR(512),
brgylogofilename VARCHAR(256),
citylogofilename VARCHAR(256),
PRIMARY KEY(id)
);

DROP TABLE IF EXISTS brgy_worker;
CREATE TABLE IF NOT EXISTS brgy_worker (
id INT AUTO_INCREMENT,
lastname VARCHAR(64),
firstname VARCHAR(64),
middlename VARCHAR(64),
birthdate date,
gender CHAR(1),
civil_status CHAR(1),
position_id INT,
worker_rank INT,
contact_no_undisclosed VARCHAR(30),
landline1 VARCHAR(12),
landline2 VARCHAR(12),
mobile1 VARCHAR(12),
mobile2 VARCHAR(12),
address1 VARCHAR(255),
address2 VARCHAR(255),
fb_account VARCHAR(32),
instagram VARCHAR(32),
photofilename VARCHAR(255),
PRIMARY KEY(id)
);

DROP TABLE IF EXISTS worker_position;
CREATE TABLE IF NOT EXISTS worker_position (
position_id INT,
position_name VARCHAR(64),
position_class CHAR(1),
position_rank INT,
maxnum_workers INT,
PRIMARY KEY(position_id)
);

DROP TABLE IF EXISTS brgy_bulletin;
CREATE TABLE IF NOT EXISTS brgy_bulletin (
bulletin_id INT NOT NULL AUTO_INCREMENT,
bulletin_classification_id INT,
bulletin_classification_icon VARCHAR(255),
bulletin_classification_title VARCHAR(255),
bulletin_classification_subtitle VARCHAR(255),
bulletin_details VARCHAR(1023),
bulletin_image_filename VARCHAR(255),
bulletin_date_created datetime,
bulletin_end_date datetime,
bulletin_created_by VARCHAR(255),
bulletin_date_updated TIMESTAMP,
bulletin_updated_by VARCHAR(1023),
bulletin_status CHAR(1),
PRIMARY KEY(bulletin_id)
);
ALTER TABLE brgy_bulletin AUTO_INCREMENT=1000; 

DROP TABLE IF EXISTS brgy_bulletin_classification;
CREATE TABLE IF NOT EXISTS brgy_bulletin_classification (
bulletin_classification_id INT,
bulletin_classification_title VARCHAR(255),
bulletin_classification_subtitle VARCHAR(255),
bulletin_classification_icon VARCHAR(255),
bulletin_hierarchy INT,
PRIMARY KEY(bulletin_classification_id)
);

DROP TABLE IF EXISTS brgy_bulletin_media;
CREATE TABLE IF NOT EXISTS brgy_bulletin_media (
bulletin_media_id INT,
bulletin_id INT,
media_filename VARCHAR(255),
PRIMARY KEY(bulletin_media_id)
);

DROP TABLE IF EXISTS brgy_bulletin_comment;
CREATE TABLE IF NOT EXISTS brgy_bulletin_comment (
bulletin_comment_id INT,
bulletin_id INT,
bulletin_reaction_type CHAR(1),
login_id CHAR(1),
need_to_address_concern BOOL,
message VARCHAR(1023),
PRIMARY KEY(bulletin_comment_id)
);

DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users (
username VARCHAR(255),
hash VARCHAR(255),
authlevel INT,
userinfo VARCHAR(1023),
PRIMARY KEY(username)
);

DROP TABLE IF EXISTS brgy_worker_credentials;
CREATE TABLE IF NOT EXISTS brgy_worker_credentials (
worker_credentials_id INT,
brgyworker_id INT,
credential_filename VARCHAR(255),
PRIMARY KEY(worker_credentials_id)
);

DROP TABLE IF EXISTS brgy_colors_hsl;
CREATE TABLE IF NOT EXISTS brgy_colors_hsl (
hsl_id INT,
hsl_hue float(11,8),
hsl_saturation float(11,8),
hsl_lightness float(11,8),
rgb_hex VARCHAR(7),
PRIMARY KEY(hsl_id)
);

INSERT INTO brgy_colors_hsl (hsl_id, hsl_hue, hsl_saturation, hsl_lightness, rgb_hex) VALUES
('0', '215.00000000', '66.66666667', '40.00000000', '#225baa'),
('1', '215.33566284', '66.66666412', '40.00000000', '#225baa');

INSERT INTO users (username, hash, authlevel, userinfo) VALUES
('root', '$2b$10$UfEN6MZ/oWFdmsiodv93qOTUCfw/ap5ZSQB5gr7v0weV44h4bKERW', 3, '{"displayname":"Root Account","email":"root@localhost"}'),
('admin', '$2b$10$B3LeBvcoujIKcShDT6yd7uGI/CUx/dBAv2waVNFhP64fp2MEF2eLq', 2, '{"displayname":"Admin","email":"brgykodego@gmail.com"}'),
('user', '$2b$10$M6F27PFDbnxTEaEqfPb.vO5DlURn5cvJ4YQiZYAv4zcBoluf/bfC2', 1, '{"displayname":"User","email":"user@localhost"}'),
('guest', '$2b$10$I34AadPQmndpt9pNrzFBnueluep17E3phabKtvcI.lDZ6dASX9.Ei', 0, '{"displayname":"Guest","email":"guest@localhost"}'),
('bamm', '$2b$10$Q6qBGVNzqh9FAtIaFua/ueXG.wP2zubIG1RYBSJCnDsi.xodAFlOO', 1, '{"displayname":"Bamm Gabriana","email":"fbgabriana@gmail.com"}');

DROP TABLE IF EXISTS brgy_authorized_user;
DROP TABLE IF EXISTS brgy_hue;
DROP TABLE IF EXISTS logbook;
DROP TABLE IF EXISTS formdata;

