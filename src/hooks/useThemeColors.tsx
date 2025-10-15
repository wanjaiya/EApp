import { useTheme } from "../context/ThemeContext";
import { colors} from '../constants/colors';

export const useThemeColors = () =>{
    const { currentTheme } = useTheme();
    if(currentTheme === null){
        return colors['light'];
    }
    
    return colors[currentTheme];
}