import './App.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';

function App() {
  const [name, setName] = useState('');
  const [datetime, setDatetime] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    getTransactions();
  }, []);

  const getTransactions = async () => {
    try {
      const { data } = await axios.get('https://expense-tracker-yiyl2.vercel.app/api/transactions');
      setTransactions(data);
    } catch (error) {
      console.log(error);
    }
  };

  const addNewTransaction = async (e) => {
    e.preventDefault();
    const url = 'https://expense-tracker-yiyl2.vercel.app/api/transaction';
    const price = parseInt(name);
    try {
      await axios.post(url, { name, price, description, datetime, category });
      setName('');
      setDatetime('');
      setDescription('');
      setCategory('');
      getTransactions();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await axios.delete(`https://expense-tracker-yiyl2.vercel.app/api/transaction/${id}`);
      getTransactions();
    } catch (error) {
      console.log(error);
    }
  };

  const exportTransactions = async (format) => {
    try {
      const { data } = await axios.get(`https://expense-tracker-yiyl2.vercel.app/api/transactions/export?format=${format}`, {
        responseType: 'blob',
      });
      const downloadUrl = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `transactions.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.log(error);
    }
  };

  let balance = 0;
  for (const transaction of transactions) {
    balance += transaction.price;
  }

  return (
    <main>
      <div>
        <h1>Rs {balance}</h1>
        <form>
          <div className="basic">
            <input
              type="text"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              placeholder={'+2000 New TV'}
            />
          </div>
          <div className="basic">
            <input
              value={datetime}
              onChange={(ev) => setDatetime(ev.target.value)}
              type="datetime-local"
            />
          </div>
          <div className="description">
            <input
              type="text"
              value={description}
              onChange={(ev) => setDescription(ev.target.value)}
              placeholder={'Description'}
            />
          </div>
          <div className="category">
            <select value={category} onChange={(ev) => setCategory(ev.target.value)}>
              <option value="">Select Category</option>
              <option value="General Expenses">General Expenses</option>
              <option value="Misc">Misc</option>
              <option value="Shopping">Shopping</option>
              <option value="Travel">Travel</option>
              <option value="Utilities">Utilities</option>
            </select>
          </div>
          <div className="button-container">
            <button onClick={addNewTransaction}>Add New Transaction</button>
            // <button onClick={() => exportTransactions('csv')}>Export as CSV</button>
            // <button onClick={() => exportTransactions('pdf')}>Export as PDF</button>
             <button onClick={getTransactions}>Get Transactions</button>
          </div>
        </form>
      </div>
      <div className="transactions">
        {transactions.length > 0 &&
          transactions.map((transaction, index) => (
            <div key={index} className="transaction">
              <div className="left">
                <div className="name">
                  {transaction.name.substring(transaction.name.indexOf(' ') + 1)}
                </div>
                <div className="description">{transaction.description}</div>
                <div className="category">Category: {transaction.category}</div>
              </div>
              <div className="right">
                <div className={'price ' + (transaction.price < 0 ? 'red' : 'green')}>
                  Rs{transaction.price}
                </div>
                <div className="datetime">
                  {moment(transaction.datetime).format('MMMM Do YYYY, h:mm:ss a')}
                </div>
                <button
                  className="delete-button"
                  onClick={() => deleteTransaction(transaction._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>
    </main>
  );
}

export default App;
