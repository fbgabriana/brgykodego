USE barangay;
DELETE FROM brgy_hue WHERE hue_id = 0;
INSERT INTO brgy_hue (hue_id, hue_primary, hue_secondary, hue_tertiary) VALUES (
0, "120", "180", "0"
);

