// tailoring-shop.js - Complete Tailoring Shop Management System

// Tailoring Shop Configuration
const TAILORING_CONFIG = {
    garmentTypes: ['Shirt', 'Trouser', 'Dress', 'Skirt', 'Blouse', 'Suit', 'Traditional Wear', 'Other'],
    fabricTypes: ['Cotton', 'Linen', 'Silk', 'Wool', 'Polyester', 'Chitenge', 'Other'],
    expenseCategories: ['Thread & Supplies', 'Equipment Maintenance', 'Rent', 'Utilities', 'Transport', 'Other'],
    orderStatuses: {
        'pending': { name: 'Pending', color: 'yellow' },
        'in-progress': { name: 'In Progress', color: 'blue' },
        'completed': { name: 'Completed', color: 'green' },
        'delivered': { name: 'Delivered', color: 'purple' }
    }
};

// Firebase References for Tailoring
const getTailoringCustomersRef = () => {
    if (!db || !currentDataId) return null;
    const currentAppId = canvasFirebaseConfig ? canvasAppId : CUSTOM_APP_ID; 
    const collectionPath = `/artifacts/${currentAppId}/users/${currentDataId}/tailoring_customers`;
    return collection(db, collectionPath);
};

const getTailoringOrdersRef = () => {
    if (!db || !currentDataId) return null;
    const currentAppId = canvasFirebaseConfig ? canvasAppId : CUSTOM_APP_ID; 
    const collectionPath = `/artifacts/${currentAppId}/users/${currentDataId}/tailoring_orders`;
    return collection(db, collectionPath);
};

const getTailoringFabricsRef = () => {
    if (!db || !currentDataId) return null;
    const currentAppId = canvasFirebaseConfig ? canvasAppId : CUSTOM_APP_ID; 
    const collectionPath = `/artifacts/${currentAppId}/users/${currentDataId}/tailoring_fabrics`;
    return collection(db, collectionPath);
};

const getTailoringExpensesRef = () => {
    if (!db || !currentDataId) return null;
    const currentAppId = canvasFirebaseConfig ? canvasAppId : CUSTOM_APP_ID; 
    const collectionPath = `/artifacts/${currentAppId}/users/${currentDataId}/tailoring_expenses`;
    return collection(db, collectionPath);
};

// Tailoring Shop Functions
class TailoringShop {
    static async addCustomer() {
        if (!isDatabaseReady) {
            showMessage('Database is offline. Cannot save customer.', 'bg-yellow-100 text-yellow-700');
            return;
        }

        const name = document.getElementById('customerName').value.trim();
        const phone = document.getElementById('customerPhone').value.trim();
        const email = document.getElementById('customerEmail').value.trim();
        const address = document.getElementById('customerAddress').value.trim();
        const notes = document.getElementById('customerNotes').value.trim();

        if (!name) {
            showMessage('Please enter customer name.', 'bg-red-100 text-red-700');
            return;
        }

        const customersRef = getTailoringCustomersRef();
        if (!customersRef) return;

        try {
            await addDoc(customersRef, {
                name,
                phone,
                email,
                address,
                notes,
                createdAt: new Date(),
                totalOrders: 0,
                totalSpent: 0
            });

            document.getElementById('customerForm').reset();
            showMessage('Customer added successfully!', 'bg-green-100 text-green-700');
            this.loadCustomers();
        } catch (error) {
            console.error("Error adding customer:", error);
            showMessage('Failed to add customer. Check console.', 'bg-red-100 text-red-700');
        }
    }

    static async addOrder() {
        if (!isDatabaseReady) {
            showMessage('Database is offline. Cannot save order.', 'bg-yellow-100 text-yellow-700');
            return;
        }

        const customerId = document.getElementById('orderCustomer').value;
        const garmentType = document.getElementById('garmentType').value;
        const fabricType = document.getElementById('orderFabric').value;
        const measurements = document.getElementById('measurements').value.trim();
        const price = parseFloat(document.getElementById('orderPrice').value) || 0;
        const advancePayment = parseFloat(document.getElementById('advancePayment').value) || 0;
        const dueDate = document.getElementById('orderDueDate').value;
        const notes = document.getElementById('orderNotes').value.trim();

        if (!customerId || !garmentType || price <= 0) {
            showMessage('Please fill all required fields with valid data.', 'bg-red-100 text-red-700');
            return;
        }

        const ordersRef = getTailoringOrdersRef();
        if (!ordersRef) return;

        try {
            await addDoc(ordersRef, {
                customerId,
                customerName: document.getElementById('orderCustomer').options[document.getElementById('orderCustomer').selectedIndex].text,
                garmentType,
                fabricType,
                measurements,
                price,
                advancePayment,
                balance: price - advancePayment,
                dueDate,
                notes,
                status: 'pending',
                createdAt: new Date(),
                orderDate: todayDocumentId
            });

            document.getElementById('orderForm').reset();
            showMessage('Order added successfully!', 'bg-green-100 text-green-700');
            this.loadOrders();
            this.updateDashboard();
        } catch (error) {
            console.error("Error adding order:", error);
            showMessage('Failed to add order. Check console.', 'bg-red-100 text-red-700');
        }
    }

    static async updateOrderStatus(orderId, newStatus) {
        if (!isDatabaseReady) {
            showMessage('Database is offline. Cannot update order.', 'bg-yellow-100 text-yellow-700');
            return;
        }

        const ordersRef = getTailoringOrdersRef();
        if (!ordersRef) return;

        try {
            const orderDoc = doc(db, ordersRef.path, orderId);
            await updateDoc(orderDoc, {
                status: newStatus,
                updatedAt: new Date()
            });

            showMessage('Order status updated successfully!', 'bg-green-100 text-green-700');
            this.loadOrders();
            this.updateDashboard();
        } catch (error) {
            console.error("Error updating order:", error);
            showMessage('Failed to update order. Check console.', 'bg-red-100 text-red-700');
        }
    }

    static async addFabric() {
        if (!isDatabaseReady) {
            showMessage('Database is offline. Cannot save fabric.', 'bg-yellow-100 text-yellow-700');
            return;
        }

        const name = document.getElementById('fabricName').value.trim();
        const type = document.getElementById('fabricType').value;
        const color = document.getElementById('fabricColor').value.trim();
        const quantity = parseFloat(document.getElementById('fabricQuantity').value) || 0;
        const costPerMeter = parseFloat(document.getElementById('fabricCost').value) || 0;
        const supplier = document.getElementById('fabricSupplier').value.trim();

        if (!name || quantity <= 0 || costPerMeter <= 0) {
            showMessage('Please fill all required fields with valid data.', 'bg-red-100 text-red-700');
            return;
        }

        const fabricsRef = getTailoringFabricsRef();
        if (!fabricsRef) return;

        try {
            await addDoc(fabricsRef, {
                name,
                type,
                color,
                quantity,
                costPerMeter,
                totalCost: quantity * costPerMeter,
                supplier,
                createdAt: new Date()
            });

            document.getElementById('fabricForm').reset();
            showMessage('Fabric added to inventory!', 'bg-green-100 text-green-700');
            this.loadFabrics();
            this.updateDashboard();
        } catch (error) {
            console.error("Error adding fabric:", error);
            showMessage('Failed to add fabric. Check console.', 'bg-red-100 text-red-700');
        }
    }

    static async addExpense() {
        if (!isDatabaseReady) {
            showMessage('Database is offline. Cannot save expense.', 'bg-yellow-100 text-yellow-700');
            return;
        }

        const category = document.getElementById('tailoringExpenseCategory').value;
        const amount = parseFloat(document.getElementById('tailoringExpenseAmount').value) || 0;
        const description = document.getElementById('tailoringExpenseDescription').value.trim();

        if (amount <= 0 || !description) {
            showMessage('Please enter valid amount and description.', 'bg-red-100 text-red-700');
            return;
        }

        const expensesRef = getTailoringExpensesRef();
        if (!expensesRef) return;

        try {
            await addDoc(expensesRef, {
                category,
                amount,
                description,
                date: todayDocumentId,
                createdAt: new Date()
            });

            document.getElementById('tailoringExpenseForm').reset();
            showMessage('Expense recorded successfully!', 'bg-green-100 text-green-700');
            this.loadExpenses();
            this.updateDashboard();
        } catch (error) {
            console.error("Error adding tailoring expense:", error);
            showMessage('Failed to record expense. Check console.', 'bg-red-100 text-red-700');
        }
    }

    static async loadCustomers() {
        const customersRef = getTailoringCustomersRef();
        if (!customersRef) return;

        try {
            const q = query(customersRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            
            const customersList = document.getElementById('customersList');
            const customerSelect = document.getElementById('orderCustomer');
            
            customersList.innerHTML = '';
            customerSelect.innerHTML = '<option value="">Select Customer</option>';
            
            if (querySnapshot.empty) {
                customersList.innerHTML = '<div class="text-gray-500 italic text-center py-8">No customers found</div>';
            } else {
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const customer = document.createElement('div');
                    customer.className = 'p-4 border border-gray-300 rounded-lg mb-3';
                    
                    customer.innerHTML = `
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <h4 class="font-bold text-gray-800">${data.name}</h4>
                                <p class="text-sm text-gray-600">${data.phone || 'No phone'}</p>
                            </div>
                            <div class="text-right">
                                <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">${data.totalOrders || 0} orders</span>
                            </div>
                        </div>
                        <p class="text-sm text-gray-600 mb-2">${data.address || 'No address'}</p>
                        <div class="flex justify-between text-sm">
                            <span class="text-green-600 font-medium">Total Spent: ${formatCurrency(data.totalSpent || 0)}</span>
                        </div>
                    `;
                    
                    customersList.appendChild(customer);
                    
                    // Add to customer select dropdown
                    const option = document.createElement('option');
                    option.value = doc.id;
                    option.textContent = `${data.name} (${data.phone || 'No phone'})`;
                    customerSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error("Error loading customers:", error);
        }
    }

    static async loadOrders() {
        const ordersRef = getTailoringOrdersRef();
        if (!ordersRef) return;

        try {
            const q = query(ordersRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            
            const ordersList = document.getElementById('ordersList');
            ordersList.innerHTML = '';
            
            if (querySnapshot.empty) {
                ordersList.innerHTML = '<div class="text-gray-500 italic text-center py-8">No orders found</div>';
            } else {
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const order = document.createElement('div');
                    order.className = 'p-4 border border-gray-300 rounded-lg mb-3';
                    
                    let statusClass = 'status-pending';
                    if (data.status === 'in-progress') statusClass = 'status-in-progress';
                    else if (data.status === 'completed') statusClass = 'status-completed';
                    else if (data.status === 'delivered') statusClass = 'status-delivered';
                    
                    order.innerHTML = `
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <h4 class="font-bold text-gray-800">${data.garmentType}</h4>
                                <p class="text-sm text-gray-600">Customer: ${data.customerName}</p>
                            </div>
                            <div class="text-right">
                                <span class="status-badge ${statusClass}">${data.status}</span>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-2 text-sm mb-2">
                            <div>
                                <span class="text-gray-600">Fabric:</span>
                                <span class="font-medium">${data.fabricType}</span>
                            </div>
                            <div>
                                <span class="text-gray-600">Due:</span>
                                <span class="font-medium">${data.dueDate || 'Not set'}</span>
                            </div>
                        </div>
                        <div class="grid grid-cols-3 gap-2 text-sm mb-3">
                            <div>
                                <span class="text-gray-600">Price:</span>
                                <span class="font-medium text-green-600">${formatCurrency(data.price)}</span>
                            </div>
                            <div>
                                <span class="text-gray-600">Advance:</span>
                                <span class="font-medium text-blue-600">${formatCurrency(data.advancePayment)}</span>
                            </div>
                            <div>
                                <span class="text-gray-600">Balance:</span>
                                <span class="font-medium text-red-600">${formatCurrency(data.balance)}</span>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            ${data.status !== 'in-progress' ? `<button onclick="TailoringShop.updateOrderStatus('${doc.id}', 'in-progress')" class="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Start Work</button>` : ''}
                            ${data.status === 'in-progress' ? `<button onclick="TailoringShop.updateOrderStatus('${doc.id}', 'completed')" class="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Complete</button>` : ''}
                            ${data.status === 'completed' ? `<button onclick="TailoringShop.updateOrderStatus('${doc.id}', 'delivered')" class="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700">Deliver</button>` : ''}
                        </div>
                    `;
                    
                    ordersList.appendChild(order);
                });
            }
        } catch (error) {
            console.error("Error loading orders:", error);
        }
    }

    static async loadFabrics() {
        const fabricsRef = getTailoringFabricsRef();
        if (!fabricsRef) return;

        try {
            const q = query(fabricsRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            
            const fabricsList = document.getElementById('fabricsList');
            const fabricSelect = document.getElementById('orderFabric');
            
            fabricsList.innerHTML = '';
            fabricSelect.innerHTML = '<option value="">Select Fabric</option>';
            
            if (querySnapshot.empty) {
                fabricsList.innerHTML = '<div class="text-gray-500 italic text-center py-8">No fabrics in inventory</div>';
            } else {
                let totalInventoryValue = 0;
                
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const fabric = document.createElement('div');
                    fabric.className = 'p-3 border-b border-gray-200';
                    
                    fabric.innerHTML = `
                        <div class="flex justify-between items-center">
                            <div>
                                <span class="font-medium">${data.name}</span>
                                <span class="text-sm text-gray-500 ml-2">${data.type} • ${data.color}</span>
                            </div>
                            <div class="text-right">
                                <div class="text-gray-800 font-bold">${data.quantity}m</div>
                                <div class="text-sm text-gray-500">${formatCurrency(data.totalCost)}</div>
                            </div>
                        </div>
                        <div class="text-xs text-gray-500 mt-1">Supplier: ${data.supplier || 'N/A'}</div>
                    `;
                    
                    fabricsList.appendChild(fabric);
                    totalInventoryValue += data.totalCost;
                    
                    // Add to fabric select dropdown
                    const option = document.createElement('option');
                    option.value = data.name;
                    option.textContent = `${data.name} (${data.type}, ${data.color}) - ${formatCurrency(data.costPerMeter)}/m`;
                    fabricSelect.appendChild(option);
                });
                
                document.getElementById('totalInventoryValue').textContent = formatCurrency(totalInventoryValue);
            }
        } catch (error) {
            console.error("Error loading fabrics:", error);
        }
    }

    static async loadExpenses() {
        const expensesRef = getTailoringExpensesRef();
        if (!expensesRef) return;

        try {
            const q = query(expensesRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            
            const expensesList = document.getElementById('tailoringExpensesList');
            expensesList.innerHTML = '';
            
            let totalExpenses = 0;
            const categoryTotals = {};
            
            if (querySnapshot.empty) {
                expensesList.innerHTML = '<div class="text-gray-500 italic text-center py-8">No expenses recorded</div>';
            } else {
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const expense = document.createElement('div');
                    expense.className = 'p-3 border-b border-gray-200';
                    
                    expense.innerHTML = `
                        <div class="flex justify-between items-center">
                            <div>
                                <span class="font-medium">${data.category}</span>
                                <div class="text-sm text-gray-600">${data.description}</div>
                            </div>
                            <div class="text-right">
                                <div class="text-red-600 font-bold">${formatCurrency(data.amount)}</div>
                                <div class="text-xs text-gray-500">${new Date(data.createdAt?.toDate()).toLocaleDateString()}</div>
                            </div>
                        </div>
                    `;
                    
                    expensesList.appendChild(expense);
                    totalExpenses += data.amount;
                    categoryTotals[data.category] = (categoryTotals[data.category] || 0) + data.amount;
                });
            }
            
            document.getElementById('totalTailoringExpenses').textContent = formatCurrency(totalExpenses);
        } catch (error) {
            console.error("Error loading tailoring expenses:", error);
        }
    }

    static async updateDashboard() {
        try {
            const ordersRef = getTailoringOrdersRef();
            const expensesRef = getTailoringExpensesRef();
            const fabricsRef = getTailoringFabricsRef();
            
            if (!ordersRef || !expensesRef || !fabricsRef) return;

            // Calculate orders summary
            const ordersQuery = query(ordersRef);
            const ordersSnapshot = await getDocs(ordersQuery);
            
            let totalRevenue = 0;
            let totalPending = 0;
            let totalInProgress = 0;
            let totalCompleted = 0;
            let totalDelivered = 0;
            let outstandingBalance = 0;
            
            ordersSnapshot.forEach(doc => {
                const data = doc.data();
                totalRevenue += data.price;
                outstandingBalance += data.balance;
                
                if (data.status === 'pending') totalPending++;
                else if (data.status === 'in-progress') totalInProgress++;
                else if (data.status === 'completed') totalCompleted++;
                else if (data.status === 'delivered') totalDelivered++;
            });

            // Calculate expenses
            const expensesQuery = query(expensesRef);
            const expensesSnapshot = await getDocs(expensesQuery);
            let totalExpenses = 0;
            expensesSnapshot.forEach(doc => {
                totalExpenses += doc.data().amount;
            });

            // Calculate fabric inventory value
            const fabricsQuery = query(fabricsRef);
            const fabricsSnapshot = await getDocs(fabricsQuery);
            let totalInventoryValue = 0;
            fabricsSnapshot.forEach(doc => {
                totalInventoryValue += doc.data().totalCost;
            });

            // Update dashboard displays
            document.getElementById('totalTailoringRevenue').textContent = formatCurrency(totalRevenue);
            document.getElementById('totalTailoringExpensesDisplay').textContent = formatCurrency(totalExpenses);
            document.getElementById('tailoringNetProfit').textContent = formatCurrency(totalRevenue - totalExpenses);
            document.getElementById('outstandingBalance').textContent = formatCurrency(outstandingBalance);
            document.getElementById('pendingOrders').textContent = totalPending;
            document.getElementById('inProgressOrders').textContent = totalInProgress;
            document.getElementById('completedOrders').textContent = totalCompleted;
            document.getElementById('totalInventoryValueDisplay').textContent = formatCurrency(totalInventoryValue);

        } catch (error) {
            console.error("Error updating tailoring dashboard:", error);
        }
    }

    static async loadDashboard() {
        await this.loadCustomers();
        await this.loadOrders();
        await this.loadFabrics();
        await this.loadExpenses();
        await this.updateDashboard();
    }

    static initializeEventListeners() {
        // Add event listeners for tailoring shop buttons
        const addCustomerBtn = document.getElementById('addCustomerBtn');
        const addOrderBtn = document.getElementById('addOrderBtn');
        const addFabricBtn = document.getElementById('addFabricBtn');
        const addTailoringExpenseBtn = document.getElementById('addTailoringExpenseBtn');

        if (addCustomerBtn) {
            addCustomerBtn.addEventListener('click', () => this.addCustomer());
        }
        if (addOrderBtn) {
            addOrderBtn.addEventListener('click', () => this.addOrder());
        }
        if (addFabricBtn) {
            addFabricBtn.addEventListener('click', () => this.addFabric());
        }
        if (addTailoringExpenseBtn) {
            addTailoringExpenseBtn.addEventListener('click', () => this.addExpense());
        }
    }
}

// Make TailoringShop available globally
window.TailoringShop = TailoringShop;
