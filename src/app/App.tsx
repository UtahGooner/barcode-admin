import React, {useEffect} from 'react';
import {Route, Routes} from "react-router-dom";
import {useAppDispatch} from "./configureStore";
import {useSelector} from "react-redux";
import {loadUserValidation, selectProfileValid} from "../ducks/user";
import ErrorBoundary from "../components/ErrorBoundary";
import AppContent from "./AppContent";
import CustomerList from "../ducks/customers/CustomerList";
import CustomerSettings from "../ducks/customer/CustomerSettings";
import CustomerItems from "../ducks/customer/CustomerItems";
import CustomerOrder from "../ducks/customer/CustomerOrder";
import {loadCustomers} from "../ducks/customers/actions";

const App = () => {
    const dispatch = useAppDispatch();
    const valid = useSelector(selectProfileValid);

    useEffect(() => {
        dispatch(loadCustomers())
    }, []);

    useEffect(() => {
        if (!valid) {
            return;
        }
        dispatch(loadUserValidation());
    }, [valid])


    return (
        <ErrorBoundary>
            <Routes>
                <Route path="/" element={<AppContent/>}>
                    <Route index element={<CustomerList/>}/>
                    <Route path="/:id/orders" element={<CustomerOrder />}/>
                    <Route path="/:id/settings" element={<CustomerSettings />}/>
                    <Route path="/:id/items" element={<CustomerItems />}/>
                    <Route path="*" element={<h2>Not Found</h2>}/>
                </Route>
            </Routes>
        </ErrorBoundary>
    )
}

export default App;
