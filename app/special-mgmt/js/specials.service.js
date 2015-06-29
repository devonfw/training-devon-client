// Visual Studio Code Typings and autocompletion
/// <reference path="../../../typings/angularjs/angular.d.ts"/>
angular.module('app.special-mgmt').factory('specials', 
	
	//[ 'offers',
		
	function (specialManagementRestService, offers) {
		'use strict';
		var paginatedSpecials = {};

		return {
			isActive: function (special) {
				var now = new Date();
				if (special.activeFrom < special.activeTo) {
					return now.getHours() > special.activeFrom.getHours() && now.getHours() < special.activeTo.getHours();
				} else {
					// around midnight
					return now.getHours() > special.activeFrom.getHours() || now.getHours() < special.activeTo.getHours();
				}
			},
			addOffers: function (paginatedSpecialList) {
				var self = this;

				var result = offers
					.loadAllOffers()
					.then(
					function (allOffers) {
						paginatedSpecialList = paginatedSpecialList.map(function (current) {
							var allOffersFiltered = allOffers.filter(function (offer) { 
								// TODO use id instead of description
								return offer.description === current.offerId;
							});
							var offer = allOffersFiltered.length > 0 ? allOffersFiltered[0] : null;

							if (offer) {
								current.specialOffer = offer.description;
								current.originalPrice = offer.price;
								current.savings = (current.originalPrice - current.specialPrice).toFixed(2);
								// TODO better add percentage sign via filter
								current.savingsPercentage = ((current.savings / current.originalPrice) * 100).toFixed(0) + " %";
							}

							current.activeStatus = self.isActive(current) ? "Active" : "Inactive";
							return current;
						});

						return paginatedSpecialList;

					}
					);
				return result;
			},
			getPaginatedSpecials: function (pagenumber, pagesize) {
				var self = this;

				return specialManagementRestService.getPaginatedSpecials(pagenumber, pagesize).then(function (response) {
					angular.copy(response.data, paginatedSpecials);
					return self.addOffers(paginatedSpecials.result).then(function (amendedSpecials) {
						paginatedSpecials.result = amendedSpecials;
						return paginatedSpecials;
					});
				});
			},
			deleteSpecial: function (specialId) {
				return specialManagementRestService.deleteSpecial(specialId).then(function (response) {
					// TODO check status and display confirmation or error
				});
			},
			submitSpecial: function (special) {
				return specialManagementRestService.saveSpecial(special).then(function (response) {
					// TODO check status and display confirmation or error
				});
			},
			loadSpecial: function (specialId) {
				var self = this;

				return specialManagementRestService.getSpecial(specialId).
					then(function (response) {
					// wrap in list
					return self.addOffers([response.data]);
				}).then(function (specialAsList) {
					// unwrap list
					return specialAsList[0];
				});
			},
		};
	}

//]

	);