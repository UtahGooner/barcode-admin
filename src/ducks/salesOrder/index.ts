import {QueryStatus} from "@reduxjs/toolkit/query";
import {BarcodeSalesOrderHeader, BarcodeSODetailLine, SODetailTableField} from "../../types";
import {createReducer} from "@reduxjs/toolkit";
import {
    dismissQtyGenerated,
    generateStickers,
    loadSalesOrder,
    parseSalesOrderLines,
    setExtraStickers,
    setLineQty,
    setLineSort,
    toggleAllSelected,
    toggleLineSelected
} from "./actions";
import {SortProps} from "chums-components";
import {detailSorter, itemStickerQty} from "./utils";
import {loadCustomer} from "../customer/actions";

const defaultSODetailSort: SortProps<SODetailTableField> = {field: 'BinLocation', ascending: true};

export interface SalesOrderState {
    extra: number;
    salesOrderNo: string;
    orderHeader: BarcodeSalesOrderHeader | null;
    detail: BarcodeSODetailLine[];
    loading: QueryStatus;
    saving: QueryStatus;
    loaded: boolean;
    qtyGenerated: number|null;
    sort: SortProps<SODetailTableField>
}

const initialSalesOrderState: SalesOrderState = {
    extra: 3,
    salesOrderNo: '',
    orderHeader: null,
    detail: [],
    loading: QueryStatus.uninitialized,
    saving: QueryStatus.uninitialized,
    loaded: false,
    qtyGenerated: null,
    sort: {...defaultSODetailSort},
}

const salesOrderReducer = createReducer(initialSalesOrderState, (builder) => {
    builder
        .addCase(loadSalesOrder.pending, (state, action) => {
            if (state.salesOrderNo !== action.meta.arg) {
                state.orderHeader = null;
                state.detail = [];
                state.loaded = false;
            }
            state.salesOrderNo = action.meta.arg;
            state.loading = QueryStatus.pending;
            state.qtyGenerated = null;
        })
        .addCase(loadSalesOrder.rejected, (state, action) => {
            state.loading = QueryStatus.rejected;
        })
        .addCase(loadSalesOrder.fulfilled, (state, action) => {
            state.salesOrderNo = action.payload?.header.SalesOrderNo ?? '';
            state.loading = QueryStatus.fulfilled;
            state.detail = action.payload?.detail ?? [];
            state.orderHeader = action.payload?.header ?? null;
            state.qtyGenerated = null;
        })
        .addCase(setExtraStickers, (state, action) => {
            state.extra = action.payload;
            state.detail = state.detail
                .map(row => ({
                    ...row,
                    stickerQty: itemStickerQty(row, state.extra)
                })).sort(detailSorter(state.sort))
        })
        .addCase(setLineQty, (state, action) => {
            state.detail = [
                ...state.detail.filter(row => row.LineKey !== action.payload.lineKey),
                ...state.detail.filter(row => row.LineKey === action.payload.lineKey)
                    .map(row => ({...row, stickerQty: action.payload.qty})),
            ].sort(detailSorter(state.sort))
        })
        .addCase(toggleLineSelected, (state, action) => {
            state.detail = [
                ...state.detail.filter(row => row.LineKey !== action.payload.lineKey),
                ...state.detail.filter(row => row.LineKey === action.payload.lineKey)
                    .map(row => ({...row, selected: action.payload?.forced ?? !row.selected})),
            ].sort(detailSorter(state.sort))
        })
        .addCase(toggleAllSelected, (state, action) => {
            state.detail = [
                ...state.detail.filter(row => row.ItemType === '1' && !!row.item).map(row => ({...row, selected: action.payload})),
                ...state.detail.filter(row => row.ItemType !== '1' || !row.item),
            ].sort(detailSorter(state.sort))
        })
        .addCase(setLineSort, (state, action) => {
            state.sort = action.payload;
            state.detail = state.detail.sort(detailSorter(action.payload));
        })
        .addCase(loadCustomer.fulfilled, (state, action) => {
            state.detail = parseSalesOrderLines(action.payload?.items || {}, state.detail, state.extra)
                .sort(detailSorter(state.sort));
        })
        .addCase(generateStickers.pending, (state, action) => {
            state.saving = QueryStatus.pending;
        })
        .addCase(generateStickers.rejected, (state, action) => {
            state.saving = QueryStatus.rejected;
        })
        .addCase(generateStickers.fulfilled, (state,action) => {
            state.saving = QueryStatus.fulfilled;
            state.qtyGenerated = action.payload ?? null;
        })
        .addCase(dismissQtyGenerated, (state) => {
            state.saving = QueryStatus.uninitialized;
            state.qtyGenerated = null;
        })
    ;

});

export default salesOrderReducer;
