import axios from 'axios';
import axiosInstance from '../config/axiosConfig';
import { LMS_BASE_URL } from '../config/env';

const getCourseData = async (
  token: any,
  course_id: string,
  username: any,
) => {
  try {
     
      const courseId = encodeURIComponent(course_id);
    if (token) {
      
      const response = await axiosInstance.get(
        `${LMS_BASE_URL}/api/mobile/v2/course_info/blocks/?course_id=${courseId}&username=${username}&depth=all&block_types_filter=sequential,vertical,html,problem&requested_fields=children,student_view_multi_device&all_blocks=true`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response);

      // return response
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

export { getCourseData };
