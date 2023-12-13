import axios from "axios";

const API_URL = 'http://localhost:8080/neostore/api';
const DEFAULT_HEADERS = {
    "Content-Type": "application/json",
};

export const SupplierService = {

    getSupplier(supplierId) {
        return axios.get(`${API_URL}/fornecedor/${supplierId}`, { headers: DEFAULT_HEADERS });
    },
    
    getSuppliers(page) {
        return axios.get(`${API_URL}/fornecedor?page=${page}`, { headers: DEFAULT_HEADERS });
    },
    
    storeSupplier(supplierData) {
        const body = JSON.stringify(supplierData);
        return axios.post(`${API_URL}/fornecedor`, body, { headers: DEFAULT_HEADERS });
    },

    storeSuppliersFromJson(suppliersJson) {
        return axios.post(`${API_URL}/fornecedor/from_json`, suppliersJson, { headers: DEFAULT_HEADERS });
    },

    updateSupplier(supplierId, supplierData) {
        const body = JSON.stringify(supplierData);
        return axios.put(`${API_URL}/fornecedor/${supplierId}`, body, { headers: DEFAULT_HEADERS });
    },
    
    deleteSupplier(supplierId) {
        return axios.delete(`${API_URL}/fornecedor/${supplierId}`, { headers: DEFAULT_HEADERS });
    },

};