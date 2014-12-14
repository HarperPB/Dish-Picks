class HomeController < ApplicationController
  def index
  end

  def search
    coordinates = { latitude: params[:latitude], longitude: params[:longitude] }
    parameter = {limit: 12, sort: 1, category_filter: "restaurants" }
    render json: Yelp.client.search_by_coordinates(coordinates, parameter, {lang: 'en_CA'})
  end

  def start
    coordinates = { latitude: params[:latitude], longitude: params[:longitude] }
    parameter = { term: 'restaurant', limit: 12, sort: 1 }
    render json: Yelp.client.search_by_coordinates(coordinates, parameter, {lang: 'en_CA'})
  end

end
