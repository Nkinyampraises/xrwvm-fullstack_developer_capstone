import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import './Dealers.css';
import '../assets/style.css';
import negativeIcon from '../assets/negative.png';
import neutralIcon from '../assets/neutral.png';
import positiveIcon from '../assets/positive.png';
import reviewIcon from '../assets/reviewbutton.png';
import Header from '../Header/Header';

const Dealer = () => {
  const [dealer, setDealer] = useState({});
  const [reviews, setReviews] = useState([]);
  const [unreviewed, setUnreviewed] = useState(false);

  const { id } = useParams();
  const dealerUrl = `${window.location.origin}/djangoapp/dealer/${id}`;
  const reviewsUrl = `${window.location.origin}/djangoapp/reviews/dealer/${id}`;
  const postReviewUrl = `/postreview/${id}`;

  const getDealer = useCallback(async () => {
    const res = await fetch(dealerUrl, { method: 'GET' });
    const retobj = await res.json();
    if (retobj.status === 200) {
      const dealerObjs = Array.from(retobj.dealer || []);
      if (dealerObjs.length > 0) {
        setDealer(dealerObjs[0]);
      }
    }
  }, [dealerUrl]);

  const getReviews = useCallback(async () => {
    const res = await fetch(reviewsUrl, { method: 'GET' });
    const retobj = await res.json();
    if (retobj.status === 200) {
      if (retobj.reviews.length > 0) {
        setReviews(retobj.reviews);
      } else {
        setUnreviewed(true);
      }
    }
  }, [reviewsUrl]);

  const sentimentIcon = (sentiment) => {
    if (sentiment === 'positive') return positiveIcon;
    if (sentiment === 'negative') return negativeIcon;
    return neutralIcon;
  };

  useEffect(() => {
    getDealer();
    getReviews();
  }, [getDealer, getReviews]);

  const canPostReview = Boolean(sessionStorage.getItem('username'));

  return (
    <div style={{ margin: '20px' }}>
      <Header />
      <div style={{ marginTop: '10px' }}>
        <h1 style={{ color: 'grey' }}>
          {dealer.full_name}
          {canPostReview ? (
            <a href={postReviewUrl}>
              <img
                src={reviewIcon}
                style={{ width: '10%', marginLeft: '10px', marginTop: '10px' }}
                alt="Post Review"
              />
            </a>
          ) : null}
        </h1>
        <h4 style={{ color: 'grey' }}>
          {dealer.city}, {dealer.address}, Zip - {dealer.zip}, {dealer.state}
        </h4>
      </div>
      <div className="reviews_panel">
        {reviews.length === 0 && !unreviewed ? (
          <span>Loading Reviews....</span>
        ) : unreviewed ? (
          <div>No reviews yet!</div>
        ) : (
          reviews.map((review) => (
            <div key={`${review.id}-${review.time || ''}`} className="review_panel">
              <img src={sentimentIcon(review.sentiment)} className="emotion_icon" alt="Sentiment" />
              <div className="review">{review.review}</div>
              <div className="reviewer">
                {review.name} {review.car_make} {review.car_model} {review.car_year}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dealer;
