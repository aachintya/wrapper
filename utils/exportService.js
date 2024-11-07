import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { format } from 'date-fns';
import * as Print from 'expo-print';

export const exportService = {
  async exportToJSON(transactions) {
    try {
      const jsonContent = JSON.stringify(transactions, null, 2);
      const fileName = `expenses_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.json`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(filePath, jsonContent);
      await shareFile(filePath);
    } catch (error) {
      console.error('Error exporting to JSON:', error);
      throw error;
    }
  },

  async exportToCSV(transactions) {
    try {
      const headers = ['Date', 'Type', 'Category', 'Amount', 'Account', 'Note'];
      const rows = transactions.map(t => [
        format(new Date(t.date), 'yyyy-MM-dd HH:mm:ss'),
        t.type,
        t.category,
        t.amount.toString(),
        t.account,
        t.note || ''
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      const fileName = `expenses_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(filePath, csvContent);
      await shareFile(filePath);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw error;
    }
  },

  async exportToPDF(transactions) {
    try {
      const groupedTransactions = groupTransactionsByMonth(transactions);
      const htmlContent = generatePDFContent(groupedTransactions);
      
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false
      });
      
      await shareFile(uri);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw error;
    }
  }
};

const shareFile = async (filePath) => {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing is not available on this platform');
  }
  await Sharing.shareAsync(filePath);
};

const groupTransactionsByMonth = (transactions) => {
  return transactions.reduce((groups, transaction) => {
    const date = new Date(transaction.date);
    const monthYear = format(date, 'MMMM yyyy');
    
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(transaction);
    return groups;
  }, {});
};

const generatePDFContent = (groupedTransactions) => {
  const monthSections = Object.entries(groupedTransactions)
    .map(([month, transactions]) => {
      const rows = transactions
        .map(t => `
          <tr>
            <td>${format(new Date(t.date), 'MMM dd, yyyy')}</td>
            <td>${t.category}</td>
            <td>${t.type}</td>
            <td style="text-align: right">₹${t.amount.toFixed(2)}</td>
            <td>${t.account}</td>
            <td>${t.note || ''}</td>
          </tr>
        `)
        .join('');

      const monthlyTotal = transactions.reduce((sum, t) => {
        return t.type === 'EXPENSE' ? sum - t.amount : sum + t.amount;
      }, 0);

      return `
        <div class="month-section">
          <h2>${month}</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Account</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3">Monthly Total</td>
                <td style="text-align: right">₹${monthlyTotal.toFixed(2)}</td>
                <td colspan="2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      `;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 8px; border: 1px solid #ddd; }
          th { background-color: #f5f5f5; }
          .month-section { margin-bottom: 30px; }
          h2 { color: #666; border-bottom: 2px solid #666; padding-bottom: 5px; }
        </style>
      </head>
      <body>
        <h1>Expense Report</h1>
        ${monthSections}
      </body>
    </html>
  `;
};