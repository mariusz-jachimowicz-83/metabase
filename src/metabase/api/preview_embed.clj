(ns metabase.api.preview-embed
  (:require [compojure.core :refer [GET]]
            (metabase.api [common :as api]
                          [embed :as embed-api]
                          [public :as public-api])
            [metabase.util.embed :as eu]))

(defn- check-and-unsign [token]
  (api/check-superuser)
  (api/check-embedding-enabled)
  (eu/unsign token))

(api/defendpoint GET "/card/:token"
  "Preview how an embedded Card will by passing a JWT TOKEN."
  [token]
  (let [unsigned-token (check-and-unsign token)
        card-id        (eu/get-in-unsigned-token-or-throw unsigned-token [:resource :question])
        token-params   (eu/get-in-unsigned-token-or-throw unsigned-token [:params])]
    ;; TODO - enforce params whitelist, passed as :_embedding_params
    (-> (public-api/public-card :id card-id)
        embed-api/add-implicit-card-parameters
        (embed-api/remove-token-parameters token-params))))

(api/defendpoint GET "/card/:token/query"
  [token & query-params]
  (let [unsigned-token   (check-and-unsign token)
        card-id          (eu/get-in-unsigned-token-or-throw unsigned-token [:resource :question])
        token-params     (eu/get-in-unsigned-token-or-throw unsigned-token [:params])
        ;; TODO - enforce params whitelist, passed as :_embedding_params
        parameter-values (merge query-params token-params)
        parameters       (embed-api/apply-parameter-values (embed-api/resolve-card-parameters card-id) parameter-values)]
    (public-api/run-query-for-card-with-id card-id parameters)))

(api/defendpoint GET "/dashboard/:token"
  [token]
  (let [unsigned     (check-and-unsign token)
        id           (eu/get-in-unsigned-token-or-throw unsigned [:resource :dashboard])
        token-params (eu/get-in-unsigned-token-or-throw unsigned [:params])]
    ;; TODO - enforce params whitelist, passed as :_embedding_params
    (-> (public-api/public-dashboard :id id)
        (embed-api/remove-token-parameters token-params))))

(api/defendpoint GET "/dashboard/:token/dashcard/:dashcard-id/card/:card-id"
  [token dashcard-id card-id & query-params]
  (let [unsigned-token   (check-and-unsign token)
        dashboard-id     (eu/get-in-unsigned-token-or-throw unsigned-token [:resource :dashboard])
        token-params     (eu/get-in-unsigned-token-or-throw unsigned-token [:params])
        parameter-values (merge query-params token-params)
        parameters       (embed-api/apply-parameter-values (embed-api/resolve-dashboard-parameters dashboard-id dashcard-id card-id) parameter-values)]
    ;; TODO - enforce params whitelist for dashboard
    (public-api/public-dashcard-results dashboard-id card-id parameters)))


(api/define-routes)
