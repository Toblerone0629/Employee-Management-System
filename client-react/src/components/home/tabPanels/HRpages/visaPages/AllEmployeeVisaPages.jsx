import React from "react";
import { CircularProgress, Typography, Collapse, TextField, Box, Button, Table, TableBody, TableHead, TableRow, TableCell, Chip, TableContainer, InputBase, IconButton, Paper, Tooltip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { getRegistors } from "../../../../../services/registrationApi";
import { StyledTableCell, StyledTableRow } from "../EmployeeProfilesPage";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import GetAppIcon from '@mui/icons-material/GetApp'; // 下载图标
import VisibilityIcon from '@mui/icons-material/Visibility'; // 预览图标

const COLUMNS = [
    { id: "name", label: "Name" },
    { id: "visaTitle", label: "Work Authorization" },
    { id: "startDate", label: "Authorization Start" },
    { id: "endDate", label: "Authorization End" },
    { id: "daysRemaining", label: "Days Remaining" },
];

const transformOptDocs = (optDocs) => {
    let transformed = [];
    optDocs.Docs.forEach((docType, i) => {
        const status = i < optDocs.curDoc ? 'approved' :
            i === optDocs.curDoc ? optDocs.Status[optDocs.curStatus] :
                'empty';

        optDocs[docType].forEach(fileLink => {
            transformed.push({
                name: fileLink,
                status: status,
                docs_type: docType
            });
        });
    });

    return transformed;
};

export default function AllEmployeeVisaPages({ employees }) {
    const [searchTerm, setSearchTerm] = React.useState("");
    const handleSearch = (event) => {
        setSearchTerm(event.target.value.toLowerCase());
    };

    const filteredEmployees = employees.filter(employee =>
        employee.name.toLowerCase().includes(searchTerm)
    );
    return (
        <Box sx={{ paddingTop: "15px" }}>
            {/* <Box sx={{ display: "flex"  }}> */}
            <Paper sx={{ p: "2px 4px", display: "flex", alignItems: "center", margin: "10px 100px" }} >
                <InputBase sx={{ ml: 1, flex: 1 }} placeholder="Search Employees" onChange={handleSearch} />
                <IconButton type="button" >
                    <SearchIcon />
                </IconButton>
            </Paper>
            {/* </Box> */}
            <TableContainer component={Paper}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell />
                            {COLUMNS.map((column) => (
                                <StyledTableCell key={column.id} align="center" style={{ minWidth: column.minWidth }} >
                                    {column.label}
                                </StyledTableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            filteredEmployees.map((employee, index) => (
                                <EmployeeRow key={index} employee={employee} />
                            ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>
        </Box >


    );
};
const ChipColor = (status) => {
    switch (status) {
        case "rejected":
            return "error";
        case "approved":
            return "success";
        default:
            return "info";
    }
};
function EmployeeRow({ employee }) {
    const [open, setOpen] = React.useState(false);
    const files = transformOptDocs(employee.optDocs);
    console.log("files: ", files);
    const calculateDaysRemaining = (endDate) => {
        const end = new Date(endDate);
        const now = new Date();
        return Math.ceil((end - now) / (1000 * 60 * 60 * 24)); // 计算剩余天数
    };
    const employeeData = {
        name: employee.name,
        visaTitle: employee.opt.title,
        startDate: employee.opt.start_date,
        endDate: employee.opt.end_date,
        daysRemaining: calculateDaysRemaining(employee.opt.end_date)
    };
    const getfileName = (filelink) => {
        const parsedUrl = new URL(filelink);
        const pathname = parsedUrl.pathname;
        const filename = pathname.substring(pathname.lastIndexOf("/") + 1, pathname.indexOf("-", pathname.lastIndexOf("/")));
        console.log(filename);
        return filename;
    }

    return (
        <React.Fragment>
            <StyledTableRow sx={{ "& > *": { borderBottom: "unset" } }}>
                <StyledTableCell align="center">
                    <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </StyledTableCell>
                {COLUMNS.map((column, index) => (
                    <StyledTableCell key={index} align="center">
                        {employeeData[column.id]}
                    </StyledTableCell>
                ))}
            </StyledTableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                                Documents
                            </Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center">Filename</TableCell>
                                        <TableCell align="center">Process</TableCell>
                                        <TableCell align="center">Status</TableCell>
                                        <TableCell align="center" />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {files.map((file, index) => (
                                        <TableRow key={index}>
                                            <StyledTableCell align="center" sx={{ maxWidth: "200px" }}>{getfileName(file.name)}</StyledTableCell>
                                            <StyledTableCell align="center">{file.docs_type}</StyledTableCell>
                                            <StyledTableCell align="center"><Chip label={file.status} color={ChipColor(file.status)} variant="outlined" /></StyledTableCell>
                                            <StyledTableCell align="center">
                                                <IconButton onClick={() => {/* todo预览操作 */ }}>
                                                    <VisibilityIcon />
                                                </IconButton>
                                                <IconButton component="a" href={file.name} download>
                                                    <GetAppIcon />
                                                </IconButton>
                                            </StyledTableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}