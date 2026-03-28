import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import './Dealers.css';
import '../assets/style.css';
import Header from '../Header/Header';

const PostReview = () => {
  const [dealer, setDealer] = useState({});
  const [review, setReview] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [date, setDate] = useState('');
  const [purchase, setPurchase] = useState(false);
  const [carModels, setCarModels] = useState([]);

  const { id } = useParams();
  const dealerUrl = `${window.location.origin}/djangoapp/dealer/${id}`;
  const reviewUrl = `${window.location.origin}/djangoapp/add_review`;
  const carModelsUrl = `${window.location.origin}/djangoapp/get_cars`;

  const postReview = async () => {
    let name = `${sessionStorage.getItem('firstname')} ${sessionStorage.getItem('lastname')}`.trim();
    if (!name || name.includes('null')) {
      name = sessionStorage.getItem('username');
    }

    if (!review.trim()) {
      alert('Review text is required.');
      return;
    }

    if (purchase && (!model || !date || !year)) {
      alert('Purchase date, car make/model, and car year are required when purchase is checked.');
      return;
    }

    let makeChosen = '';
    let modelChosen = '';
    if (model) {
      const modelSplit = model.split('|');
      makeChosen = modelSplit[0];
      modelChosen = modelSplit[1];
    }

    const payload = JSON.stringify({
      name,
      dealership: id,
      review,
      purchase,
      purchase_date: purchase ? date : '',
      car_make: purchase ? makeChosen : '',
      car_model: purchase ? modelChosen : '',
      car_year: purchase ? Number(year) : '',
    });

    const res = await fetch(reviewUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload,
    });

    const json = await res.json();
    if (json.status === 200) {
      window.location.href = `/dealer/${id}`;
      return;
    }
    alert('Unable to submit review.');
  };

  const getDealer = useCallback(async () => {
    const res = await fetch(dealerUrl, {
      method: 'GET',
    });
    const retobj = await res.json();

    if (retobj.status === 200) {
      const dealerObjs = Array.from(retobj.dealer || []);
      if (dealerObjs.length > 0) setDealer(dealerObjs[0]);
    }
  }, [dealerUrl]);

  const getCars = useCallback(async () => {
    const res = await fetch(carModelsUrl, {
      method: 'GET',
    });
    const retobj = await res.json();
    const carModelsArr = Array.from(retobj.CarModels || []);
    setCarModels(carModelsArr);
  }, [carModelsUrl]);

  useEffect(() => {
    getDealer();
    getCars();
  }, [getDealer, getCars]);

  return (
    <div>
      <Header />
      <div style={{ margin: '5%' }}>
        <h1 style={{ color: 'darkblue' }}>{dealer.full_name}</h1>
        <textarea id="review" cols="50" rows="7" onChange={(e) => setReview(e.target.value)} />

        <div className="input_field">
          <label htmlFor="purchase_checkbox">
            <input
              id="purchase_checkbox"
              type="checkbox"
              checked={purchase}
              onChange={(e) => setPurchase(e.target.checked)}
            />{' '}
            Purchased a car here
          </label>
        </div>

        {purchase ? (
          <div>
            <div className="input_field">
              Purchase Date <input type="date" onChange={(e) => setDate(e.target.value)} />
            </div>

            <div className="input_field">
              Car Make/Model
              <select name="cars" id="cars" onChange={(e) => setModel(e.target.value)} defaultValue="">
                <option value="" disabled hidden>
                  Choose Car Make and Model
                </option>
                {carModels.map((carModel) => (
                  <option
                    key={`${carModel.CarMake}-${carModel.CarModel}-${carModel.id}`}
                    value={`${carModel.CarMake}|${carModel.CarModel}`}
                  >
                    {carModel.CarMake} {carModel.CarModel}
                  </option>
                ))}
              </select>
            </div>

            <div className="input_field">
              Car Year{' '}
              <input
                type="number"
                onChange={(e) => setYear(e.target.value)}
                max={new Date().getFullYear() + 1}
                min={2015}
              />
            </div>
          </div>
        ) : null}

        <div>
          <button className="postreview" onClick={postReview}>
            Post Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostReview;
