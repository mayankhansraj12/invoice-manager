import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InvoiceDetails from './pages/InvoiceDetails';

import InvoiceList from './components/InvoiceList';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/invoices/:id" element={<InvoiceDetails />} />
                <Route path="/" element={<InvoiceList />} />
            </Routes>
        </Router>
    );
}

export default App;
