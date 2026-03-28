import React, { useCallback, useEffect, useState } from 'react';

import './Dealers.css';
import '../assets/style.css';
import reviewIcon from '../assets/reviewicon.png';
import Header from '../Header/Header';

const Dealers = () => {
  const [dealersList, setDealersList] = useState([]);
  const [states, setStates] = useState([]);
  const dealerUrl = `${window.location.origin}/djangoapp/get_dealers`;

  const getDealers = useCallback(async () => {
    const res = await fetch(dealerUrl, { method: 'GET' });
    const retobj = await res.json();

    if (retobj.status === 200) {
      const allDealers = Array.from(retobj.dealers || []);
      const stateValues = allDealers.map((dealer) => dealer.state);
      setStates(Array.from(new Set(stateValues)));
      setDealersList(allDealers);
    }
  }, [dealerUrl]);

  const filterDealers = async (state) => {
    if (!state || state === 'All') {
      getDealers();
      return;
    }

    const byStateUrl = `${dealerUrl}/${state}`;
    const res = await fetch(byStateUrl, { method: 'GET' });
    const retobj = await res.json();
    if (retobj.status === 200) {
      setDealersList(Array.from(retobj.dealers || []));
    }
  };

  useEffect(() => {
    getDealers();
  }, [getDealers]);

  const isLoggedIn = Boolean(sessionStorage.getItem('username'));

  return (
    <div>
      <Header />
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Dealer Name</th>
            <th>City</th>
            <th>Address</th>
            <th>Zip</th>
            <th>
              <select name="state" id="state" onChange={(e) => filterDealers(e.target.value)} defaultValue="">
                <option value="" disabled hidden>
                  State
                </option>
                <option value="All">All States</option>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </th>
            {isLoggedIn ? <th>Review Dealer</th> : null}
          </tr>
        </thead>
        <tbody>
          {dealersList.map((dealer) => (
            <tr key={dealer.id}>
              <td>{dealer.id}</td>
              <td>
                <a href={`/dealer/${dealer.id}`}>{dealer.full_name}</a>
              </td>
              <td>{dealer.city}</td>
              <td>{dealer.address}</td>
              <td>{dealer.zip}</td>
              <td>{dealer.state}</td>
              {isLoggedIn ? (
                <td>
                  <a href={`/postreview/${dealer.id}`}>
                    <img src={reviewIcon} className="review_icon" alt="Post Review" />
                  </a>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dealers;
