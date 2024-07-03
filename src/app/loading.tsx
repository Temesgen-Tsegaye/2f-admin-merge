import { Box } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";

export default function Loading() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "70vw",
        minHeight: "70vh",
      }}
    >
      <CircularProgress color="warning" />
    </Box>
  );
}
