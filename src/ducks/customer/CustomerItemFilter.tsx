import React, {ChangeEvent, MouseEvent} from 'react';
import {useAppDispatch} from "../../app/configureStore";
import {useSelector} from "react-redux";
import {selectItemsFilter} from "./selectors";
import {setItemFilter} from "./actions";

const CustomerItemFilter = () => {
    const dispatch = useAppDispatch();
    const filter = useSelector(selectItemsFilter);
    const changeHandler = (ev: ChangeEvent<HTMLInputElement>) => {
        dispatch(setItemFilter(ev.target.value));
    }
    const focusHandler = (ev:MouseEvent<HTMLInputElement>) => {
        ev.preventDefault();
        ev.stopPropagation();
    }

    return (
        <div className="input-group input-group-sm">
            <div className="input-group-text">Filter Item</div>
            <input type="search" className="form-control form-control-sm"
                   onChange={changeHandler} value={filter} onClick={focusHandler}/>
        </div>
    )
}

export default CustomerItemFilter;
