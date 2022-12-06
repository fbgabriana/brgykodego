REPLACE INTO brgy_info (id,brgy_num,brgy_name,brgy_address1,brgy_address2,brgy_district,brgy_city,brgy_postal_code,brgy_email,brgy_hotline_no,brgy_landline1,brgy_landline2,brgy_mobile1,brgy_mobile2,brgy_intro,brgy_mission,brgy_vision,brgylogofilename,citylogofilename) VALUES (
0,0,'Barangay KodeGo','','','0','Taguig City, Philippines','1630','','','','','','','brgy_intro','brgy_mission','brgy_vision','logo-brgy.svg','logo-lgu.png'
);
REPLACE INTO brgy_bulletin (bulletin_id, bulletin_classification_id, bulletin_classification_icon, bulletin_classification_title, bulletin_classification_subtitle, bulletin_details, bulletin_image_filename,bulletin_date_created) VALUES (
1000, 0, 'sample-post', 'bulletin classification title', 'bulletin classification subtitle','<p>bulletin details</p>','', '1970-01-01 00-00-00'
);
REPLACE INTO brgy_bulletin (bulletin_id, bulletin_classification_id, bulletin_classification_icon, bulletin_classification_title, bulletin_classification_subtitle, bulletin_details, bulletin_image_filename,bulletin_date_created) VALUES (
1001, 1, 'project-update', 'Barangay Project Update', 'Playground Renovation','','','2022-10-24 00-00-00'
);
REPLACE INTO brgy_bulletin (bulletin_id, bulletin_classification_id, bulletin_classification_icon, bulletin_classification_title, bulletin_classification_subtitle, bulletin_details, bulletin_image_filename,bulletin_date_created) VALUES (
1002, 2, 'news-update', 'Barangay News Update', 'Oplan Todos Los Santos','','','2022-10-25 00-00-00'
);
REPLACE INTO brgy_bulletin (bulletin_id, bulletin_classification_id, bulletin_classification_icon, bulletin_classification_title, bulletin_classification_subtitle, bulletin_details, bulletin_image_filename,bulletin_date_created) VALUES (
1003, 3, 'waterservice', 'Water Interruption', 'Scheduled Maintenance','<p>Attention!</p><p>Pinapapaalalahanan ang lahat ng nasasakupan...</p>','1003.png','2022-11-24 00-00-00'
);
REPLACE INTO brgy_bulletin (bulletin_id, bulletin_classification_id, bulletin_classification_icon, bulletin_classification_title, bulletin_classification_subtitle, bulletin_details, bulletin_image_filename,bulletin_date_created) VALUES (
1004, 4, 'calamity', 'Calamity Alert', 'Flooding Due to Typhoon','<p>News Alert! Prayer Alert!</p><p>As of tonight #RollyPH is now categorized by the JTWC of the US as a Category 5 Super Typhoon.</p>','1004.png','2022-11-25 00-00-00'
);

