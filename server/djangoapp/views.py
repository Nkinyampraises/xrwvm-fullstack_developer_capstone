import json
import logging
from datetime import datetime

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import CarModel
from .restapis import analyze_review_sentiments, get_request, post_review


logger = logging.getLogger(__name__)


@csrf_exempt
def login_user(request):
    if request.method != 'POST':
        return JsonResponse({'status': 'Bad Request'}, status=400)

    data = json.loads(request.body)
    username = data.get('userName', '')
    password = data.get('password', '')

    user = authenticate(username=username, password=password)
    response_data = {'userName': username}
    if user is not None:
        login(request, user)
        response_data['status'] = 'Authenticated'
        response_data['firstName'] = user.first_name
        response_data['lastName'] = user.last_name
    return JsonResponse(response_data)


def logout_request(request):
    logout(request)
    return JsonResponse({'userName': ''})


@csrf_exempt
def registration(request):
    if request.method != 'POST':
        return JsonResponse({'status': 'Bad Request'}, status=400)

    data = json.loads(request.body)
    username = data.get('userName', '').strip()
    password = data.get('password', '')
    first_name = data.get('firstName', '')
    last_name = data.get('lastName', '')
    email = data.get('email', '')

    if not username or not password:
        return JsonResponse({'status': 'Invalid Data'}, status=400)

    if User.objects.filter(username=username).exists():
        return JsonResponse(
            {
                'userName': username,
                'error': 'Already Registered',
            },
        )

    user = User.objects.create_user(
        username=username,
        password=password,
        first_name=first_name,
        last_name=last_name,
        email=email,
    )
    login(request, user)
    return JsonResponse({'status': 'Authenticated', 'userName': username})


def get_cars(request):
    car_models = CarModel.objects.select_related('car_make').order_by('car_make__name', 'name')
    cars = [
        {
            'id': car.id,
            'CarMake': car.car_make.name,
            'CarModel': car.name,
            'Type': car.type,
            'Year': car.year,
        }
        for car in car_models
    ]
    return JsonResponse({'CarModels': cars})


def get_dealerships(request, state="All"):
    endpoint = 'fetchDealers' if state == "All" else f'fetchDealers/{state}'
    try:
        dealerships = get_request(endpoint)
        if isinstance(dealerships, dict) and 'dealers' in dealerships:
            dealerships = dealerships['dealers']
        return JsonResponse({'status': 200, 'dealers': dealerships})
    except Exception as ex:
        logger.exception('Failed to fetch dealerships: %s', ex)
        return JsonResponse({'status': 500, 'message': 'Unable to fetch dealerships'})


def get_reviews(request):
    try:
        reviews = get_request('fetchReviews')
        for review in reviews:
            review_text = review.get('review', '')
            review['sentiment'] = analyze_review_sentiments(review_text)
        reviews = sorted(
            reviews,
            key=lambda item: (item.get('time', ''), item.get('id', 0)),
            reverse=True,
        )
        return JsonResponse({'status': 200, 'reviews': reviews})
    except Exception as ex:
        logger.exception('Failed to fetch reviews: %s', ex)
        return JsonResponse({'status': 500, 'message': 'Unable to fetch reviews'})


def get_dealer_details(request, dealer_id):
    try:
        dealer = get_request(f'fetchDealer/{dealer_id}')
        if isinstance(dealer, list):
            dealer_payload = dealer
        else:
            dealer_payload = [dealer]
        return JsonResponse({'status': 200, 'dealer': dealer_payload})
    except Exception as ex:
        logger.exception('Failed to fetch dealer details: %s', ex)
        return JsonResponse({'status': 500, 'message': 'Unable to fetch dealer details'})


def get_dealer_reviews(request, dealer_id):
    try:
        reviews = get_request(f'fetchReviews/dealer/{dealer_id}')
        for review in reviews:
            review_text = review.get('review', '')
            review['sentiment'] = analyze_review_sentiments(review_text)
        reviews = sorted(
            reviews,
            key=lambda item: (item.get('time', ''), item.get('id', 0)),
            reverse=True,
        )
        return JsonResponse({'status': 200, 'reviews': reviews})
    except Exception as ex:
        logger.exception('Failed to fetch dealer reviews: %s', ex)
        return JsonResponse({'status': 500, 'message': 'Unable to fetch dealer reviews'})


@csrf_exempt
def add_review(request):
    if request.method != 'POST':
        return JsonResponse({'status': 405, 'message': 'Method not allowed'}, status=405)

    if request.user.is_anonymous:
        return JsonResponse({'status': 403, 'message': 'Unauthorized'}, status=403)

    try:
        data = json.loads(request.body)
        data['dealership'] = int(data.get('dealership'))
        data['purchase'] = bool(data.get('purchase', False))
        data['time'] = data.get('time') or datetime.utcnow().isoformat()

        data['user_id'] = request.user.id
        if not data.get('name'):
            data['name'] = request.user.get_full_name() or request.user.username

        response = post_review(data)
        return JsonResponse({'status': 200, 'review': response})
    except Exception as ex:
        logger.exception('Failed to add review: %s', ex)
        return JsonResponse({'status': 500, 'message': 'Unable to add review'})
