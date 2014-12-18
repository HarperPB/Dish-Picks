class MapController < ApplicationController

  def index
    gon.pictures = build_results_container 
  end

  def search
    coordinates = { latitude: params[:latitude], longitude: params[:longitude] }
    render json: Yelp.client.search_by_coordinates(coordinates,{term: params[:term]}, {lang: 'en_CA'})
    # parameters = { term: params[:term], limit: 16 }
  end

end
