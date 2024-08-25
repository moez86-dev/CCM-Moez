$(document).ready(function() {
    function loadContracts() {
        let contracts = JSON.parse(localStorage.getItem('contracts')) || [];
        $('#contracts-list').empty();

        if (contracts.length > 0) {
            let table = `
                <table class="table table-bordered" id="contracts-table">
                    <thead class="table-dark">
                        <tr>
                            <th>#</th> <!-- عمود التسلسل التلقائي -->
                            <th>رقم العقد</th> <!-- عمود رقم العقد -->
                            <th>اسم العميل</th>
                            <th>إجمالي مبلغ العقد</th>
                            <th>الدفعة المقدمة</th>
                            <th>الدفعات الجديدة</th>
                            <th>المبلغ المتبقي</th>
                            <th>تاريخ العقد</th>
                            <th>تاريخ نهاية العقد</th>
                            <th>ملاحظات</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            let totalAmountSum = 0, advancePaymentSum = 0, totalPaymentsSum = 0, remainingAmountSum = 0;

            contracts.forEach((contract, index) => {
                let totalPayments = contract.payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0).toFixed(2);
                let remainingAmount = (parseFloat(contract.totalAmount) - parseFloat(contract.advancePayment) - totalPayments).toFixed(2);

                totalAmountSum += parseFloat(contract.totalAmount);
                advancePaymentSum += parseFloat(contract.advancePayment);
                totalPaymentsSum += parseFloat(totalPayments);
                remainingAmountSum += parseFloat(remainingAmount);

                table += `
                    <tr>
                        <td>${index + 1}</td> <!-- التسلسل التلقائي -->
                        <td>${contract.contractNumber}</td> <!-- عرض رقم العقد -->
                        <td>${contract.clientName}</td>
                        <td>${parseFloat(contract.totalAmount).toFixed(2)}</td>
                        <td>${parseFloat(contract.advancePayment).toFixed(2)}</td>
                        <td>${totalPayments}</td>
                        <td>${remainingAmount}</td>
                        <td>${contract.contractDate}</td>
                        <td>${contract.endDate}</td>
                        <td>${contract.notes}</td>
                        <td>
                            <button class="btn btn-sm btn-info manage-payments" data-index="${index}">إدارة الدفعات</button>
                            <button class="btn btn-sm btn-success add-payment" data-index="${index}">إضافة دفعة</button>
                            <button class="btn btn-sm btn-danger delete-payment" data-index="${index}">حذف دفعات</button>
                            <button class="btn btn-sm btn-danger delete-contract" data-index="${index}">حذف العقد</button>
                        </td>
                    </tr>
                `;
            });

            table += `
                <tr class="table-dark">
                    <td colspan="3">الإجمالي</td>
                    <td>${totalAmountSum.toFixed(2)}</td>
                    <td>${advancePaymentSum.toFixed(2)}</td>
                    <td>${totalPaymentsSum.toFixed(2)}</td>
                    <td>${remainingAmountSum.toFixed(2)}</td>
                    <td colspan="4"></td>
                </tr>
            `;

            table += `
                    </tbody>
                </table>
            `;

            $('#contracts-list').append(table);
        } else {
            $('#contracts-list').append('<p class="text-center">لا توجد عقود مسجلة.</p>');
        }
    }

    function saveContract(contract) {
        let contracts = JSON.parse(localStorage.getItem('contracts')) || [];
        
        // إذا لم يكن رقم العقد موجودًا، احصل على آخر رقم تسلسل وزيده بمقدار 1
        if (!contract.contractNumber) {
            let lastContract = contracts[contracts.length - 1];
            contract.contractNumber = lastContract ? parseInt(lastContract.contractNumber) + 1 : 1;
        }
        
        contracts.push(contract);
        localStorage.setItem('contracts', JSON.stringify(contracts));
        loadContracts();
    }

    function managePayments(index) {
        let contracts = JSON.parse(localStorage.getItem('contracts')) || [];
        let contract = contracts[index];

        let paymentsTable = `
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th>نوع الدفعة</th>
                        <th>المبلغ</th>
                        <th>التاريخ</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>دفعة مقدمة</td>
                        <td>${parseFloat(contract.advancePayment).toFixed(2)}</td>
                        <td>${contract.contractDate}</td>
                    </tr>
        `;

        if (contract.payments && contract.payments.length > 0) {
            contract.payments.forEach((payment, i) => {
                paymentsTable += `
                    <tr>
                        <td>دفعة جديدة ${i + 1}</td>
                        <td>${parseFloat(payment.amount).toFixed(2)}</td>
                        <td>${payment.date}</td>
                    </tr>
                `;
            });
        } else {
            paymentsTable += `
                <tr>
                    <td colspan="3" class="text-center">لا توجد دفعات جديدة مسجلة.</td>
                </tr>
            `;
        }

        paymentsTable += `</tbody></table>`;
        $('#paymentsTableContainer').html(paymentsTable);
        $('#managePaymentsModal').modal('show');
    }

    function addPayment(index) {
        let contracts = JSON.parse(localStorage.getItem('contracts')) || [];
        let contract = contracts[index];

        let paymentAmount = prompt('أدخل مبلغ الدفعة:');
        let paymentDate = prompt('أدخل تاريخ الدفعة:');

        if (paymentAmount && paymentDate) {
            contract.payments.push({
                amount: parseFloat(paymentAmount).toFixed(2),
                date: paymentDate
            });
            contracts[index] = contract;
            localStorage.setItem('contracts', JSON.stringify(contracts));
            loadContracts();
        } else {
            alert('يرجى إدخال جميع بيانات الدفعة.');
        }
    }

    function deletePayments(index) {
        let contracts = JSON.parse(localStorage.getItem('contracts')) || [];
        if (contracts[index].payments.length > 0) {
            if (confirm('هل أنت متأكد من حذف جميع الدفعات لهذا العقد؟')) {
                contracts[index].payments = [];
                localStorage.setItem('contracts', JSON.stringify(contracts));
                loadContracts();
            }
        } else {
            alert('لا توجد دفعات لحذفها.');
        }
    }

    function deleteContract(index) {
        let contracts = JSON.parse(localStorage.getItem('contracts')) || [];
        if (confirm('هل أنت متأكد من حذف هذا العقد؟')) {
            contracts.splice(index, 1);
            localStorage.setItem('contracts', JSON.stringify(contracts));
            loadContracts();
        }
    }

    $('#saveContractBtn').click(function() {
        let contract = {
            contractNumber: $('#contractNumber').val(),
            clientName: $('#clientName').val(),
            contractDate: $('#contractDate').val(),
            endDate: $('#endDate').val(),
            totalAmount: $('#totalAmount').val(),
            advancePayment: $('#advancePayment').val(),
            notes: $('#notes').val(),
            payments: []
        };
        
        saveContract(contract);
        $('#addContractModal').modal('hide');
    });

    $('#contracts-list').on('click', '.manage-payments', function() {
        let index = $(this).data('index');
        managePayments(index);
    });

    $('#contracts-list').on('click', '.add-payment', function() {
        let index = $(this).data('index');
        addPayment(index);
    });

    $('#contracts-list').on('click', '.delete-contract', function() {
        let index = $(this).data('index');
        deleteContract(index);
    });

    $('#contracts-list').on('click', '.delete-payment', function() {
        let index = $(this).data('index');
        deletePayments(index);
    });

    $('#delete-all-contracts-btn').click(function() {
        if (confirm('هل أنت متأكد من حذف جميع العقود؟')) {
            localStorage.removeItem('contracts');
            loadContracts();
        }
    });

    $('#export-to-excel').click(function() {
        exportToExcel();
    });

    // تحميل العقود عند التحميل
    loadContracts();
});

function exportToExcel() {
    let contracts = JSON.parse(localStorage.getItem('contracts')) || [];
    if (contracts.length > 0) {
        let wb = XLSX.utils.book_new();
        let ws = XLSX.utils.json_to_sheet(contracts);
        XLSX.utils.book_append_sheet(wb, ws, 'Contracts');
        XLSX.writeFile(wb, 'Contracts.xlsx');
    } else {
        alert('لا توجد عقود لتصديرها.');
    }
}
