import React from 'react';
import { Box, Tabs, Tab, useTheme, useMediaQuery } from "@mui/material";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import Header from "./Header"
import OnboardingPage from './tabPanels/OnboardingPage';
import VisaPage from './tabPanels/VisaPage';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import TabPanels from './tabPanels/TabPanels';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';

const MobileHomePage = () => {
    const [visible, setVisible] = React.useState(true);
    const [value, setValue] = React.useState(0);
    const location = useLocation();
    const navigate = useNavigate();
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm')); // 假设'md'是你想要变化的断点

    const tabs = [
        { label: "Profile", path: "/home/profile", icon: <AccountCircleIcon /> },
        { label: "Onboarding Application", path: "/home/onboarding", icon: <AssignmentIcon /> },
        { label: "Visa Status", path: "/home/visa", icon: <ContactMailIcon /> },
        // 之后可以根据需要添加更多 Tabs
    ];
    React.useEffect(() => {
        const currentTab = tabs.findIndex(tab => tab.path === location.pathname);
        if (currentTab >= 0) {
            setValue(currentTab);
        }
    }, [location]);

    const handleChange = (event, newValue) => {
        setValue(newValue);
        navigate(tabs[newValue].path);
    };

    const handleLeftVisible = () => {
        setVisible(!visible)
        console.log("visible: ", visible)
    };
    return (
        <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#dadada" }}>
            <Header handleLeftVisible={handleLeftVisible} />
            {tabs.map((tab, index) => (
                <TabPanels key={tab.label} value={value} index={index} >
                    {value === index && <Outlet />}
                </TabPanels>
            ))}
            <Tabs
                value={value}
                onChange={handleChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                    borderTop: 1,
                    borderColor: "divider",
                    backgroundColor: "white",
                    position: 'static',
                    bottom: 0,
                    width: '100%',

                }}
            > {tabs.map((tab, index) => (
                <Tab
                    key={tab.label}
                    icon={tab.icon}
                    label={tab.label}
                    sx={{ textTransform: "none" }}
                />
            ))}
            </Tabs>

        </Box >
    )
}
export default MobileHomePage;