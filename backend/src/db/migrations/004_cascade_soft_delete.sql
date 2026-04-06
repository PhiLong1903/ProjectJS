-- Tạo một hàm Trigger để đồng bộ việc xóa mềm cho bác sĩ
CREATE OR REPLACE FUNCTION cascade_doctor_soft_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Nếu cột is_deleted của bác sĩ chuyển từ FALSE sang TRUE
    IF NEW.is_deleted = TRUE AND OLD.is_deleted = FALSE THEN
        
        -- 1. Xóa mềm toàn bộ các khung giờ của bác sĩ này
        UPDATE doctor_slots
        SET is_deleted = TRUE, is_available = FALSE, updated_at = NOW()
        WHERE doctor_id = NEW.id;

        -- 2. Hủy các cuộc hẹn đang ở trạng thái PENDING hoặc CONFIRMED
        UPDATE appointments
        SET status = 'CANCELLED', 
            doctor_response_reason = 'Hệ thống tự động hủy do bác sĩ ngừng hoạt động',
            updated_at = NOW()
        WHERE doctor_id = NEW.id 
          AND status IN ('PENDING', 'CONFIRMED');
          
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Gắn Trigger vào bảng doctors
DROP TRIGGER IF EXISTS trigger_cascade_doctor_soft_delete ON doctors;
CREATE TRIGGER trigger_cascade_doctor_soft_delete
AFTER UPDATE OF is_deleted ON doctors
FOR EACH ROW
EXECUTE FUNCTION cascade_doctor_soft_delete();