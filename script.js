document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    let materials = JSON.parse(localStorage.getItem('engineeringMaterials')) || [];
    let nextItemNumber = 10; // Starting from 000010

    // Find the next available item number
    if (materials.length > 0) {
        const maxItemNumber = Math.max(...materials.map(item => parseInt(item.itemNumber)));
        nextItemNumber = maxItemNumber + 1;
    }

    // Initialize the table
    renderTable();
    updateSummary();

    // Event listeners
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    document.getElementById('addMaterialBtn').addEventListener('click', openAddModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('materialForm').addEventListener('submit', saveMaterial);
    document.getElementById('printBtn').addEventListener('click', printTable);
    document.getElementById('exportBtn').addEventListener('click', exportToCSV);
    document.getElementById('cancelDeleteBtn').addEventListener('click', closeDeleteModal);
    document.getElementById('confirmDeleteBtn').addEventListener('click', deleteMaterial);

    // Functions
    function renderTable(filteredMaterials = null) {
        const tableBody = document.getElementById('materialsTableBody');
        tableBody.innerHTML = '';

        const materialsToRender = filteredMaterials || materials;

        if (materialsToRender.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `
                <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                    No materials found. Click "Add Material" to add your first item.
                </td>
            `;
            tableBody.appendChild(emptyRow);
            return;
        }

        materialsToRender.forEach(material => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';

            const remaining = material.inStock - material.outStock;
            const remainingClass = remaining <= 5 ? 'text-red-600 font-medium' : '';

            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${padItemNumber(material.itemNumber)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${material.name}</td>
                <td class="px-6 py-4 text-sm text-gray-700">${material.specifications}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${material.inStock}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${material.outStock}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm ${remainingClass}">${remaining}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium no-print">
                    <div class="flex space-x-2">
                        <button class="edit-btn text-blue-600 hover:text-blue-900" data-id="${material.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button class="delete-btn text-red-600 hover:text-red-900" data-id="${material.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </td>
            `;

            tableBody.appendChild(row);
        });

        // Add event listeners to edit and delete buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => openEditModal(btn.dataset.id));
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => openDeleteModal(btn.dataset.id));
        });
    }

    function padItemNumber(num) {
        return num.toString().padStart(6, '0');
    }

    function handleSearch() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();

        if (!searchTerm) {
            renderTable();
            return;
        }

        const filteredMaterials = materials.filter(material => {
            return (
                material.name.toLowerCase().includes(searchTerm) ||
                material.specifications.toLowerCase().includes(searchTerm) ||
                padItemNumber(material.itemNumber).includes(searchTerm)
            );
        });

        renderTable(filteredMaterials);
    }

    function openAddModal() {
        document.getElementById('modalTitle').textContent = 'Add New Material';
        document.getElementById('itemNumber').value = padItemNumber(nextItemNumber);
        document.getElementById('materialName').value = '';
        document.getElementById('specifications').value = '';
        document.getElementById('inStock').value = '';
        document.getElementById('outStock').value = '0';
        document.getElementById('editItemId').value = '';
        document.getElementById('materialModal').classList.remove('hidden');
    }

    function openEditModal(id) {
        const material = materials.find(m => m.id === id);
        if (!material) return;

        document.getElementById('modalTitle').textContent = 'Edit Material';
        document.getElementById('itemNumber').value = padItemNumber(material.itemNumber);
        document.getElementById('materialName').value = material.name;
        document.getElementById('specifications').value = material.specifications;
        document.getElementById('inStock').value = material.inStock;
        document.getElementById('outStock').value = material.outStock;
        document.getElementById('editItemId').value = material.id;
        document.getElementById('materialModal').classList.remove('hidden');
    }

    function closeModal() {
        document.getElementById('materialModal').classList.add('hidden');
    }

    function closeDeleteModal() {
        document.getElementById('deleteModal').classList.add('hidden');
    }

    function deleteMaterial() {
        const itemId = document.getElementById('deleteItemId').value;
        materials = materials.filter(material => material.id !== itemId);
        localStorage.setItem('engineeringMaterials', JSON.stringify(materials));
        renderTable();
        closeDeleteModal();
        updateSummary();
    }

    function printTable() {
        const tableContent = document.getElementById('materialsTable').outerHTML;
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Print Materials</title></head><body>');
        printWindow.document.write(tableContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    }

    function exportToCSV() {
        const rows = [];
        const headers = ['Item #', 'Material Name', 'Specifications', 'In Stock', 'Out Stock', 'Remaining'];
        rows.push(headers);

        materials.forEach(material => {
            const row = [
                padItemNumber(material.itemNumber),
                material.name,
                material.specifications,
                material.inStock,
                material.outStock,
                material.inStock - material.outStock
            ];
            rows.push(row);
        });

        const csvContent = rows.map(e => e.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'materials.csv';
        link.click();
    }

    function updateSummary() {
        const totalItems = materials.length;
        const lastUpdated = new Date().toLocaleString();
        document.getElementById('totalItems').textContent = `Total Materials: ${totalItems}`;
        document.getElementById('lastUpdated').textContent = `Last updated: ${lastUpdated}`;
    }

    function saveMaterial(event) {
        event.preventDefault();

        const itemNumber = document.getElementById('itemNumber').value;
        const name = document.getElementById('materialName').value;
        const specifications = document.getElementById('specifications').value;
        const inStock = parseInt(document.getElementById('inStock').value);
        const outStock = parseInt(document.getElementById('outStock').value);
        const editItemId = document.getElementById('editItemId').value;

        if (editItemId) {
            const materialIndex = materials.findIndex(m => m.id === editItemId);
            materials[materialIndex] = {
                id: editItemId,
                itemNumber: parseInt(itemNumber),
                name,
                specifications,
                inStock,
                outStock
            };
        } else {
            materials.push({
                id: Date.now().toString(),
                itemNumber: parseInt(itemNumber),
                name,
                specifications,
                inStock,
                outStock
            });
            nextItemNumber++;
        }

        localStorage.setItem('engineeringMaterials', JSON.stringify(materials));
        renderTable();
        closeModal();
        updateSummary();
    }
});
