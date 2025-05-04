import { SdStorage } from "@mui/icons-material";
import { SD_Status } from "../Utility/SD";

const getStatusColor = (status: SD_Status) => {
    return status === SD_Status.Potvrdjena ? "primary" 
        : status === SD_Status.Cekanje ? "secondary"
        : status === SD_Status.Otkazana ? "danger"
        : status === SD_Status.U_Toku ? "info"
        : status === SD_Status.Zavrsena &&  "success";
}

export default getStatusColor;