(ns metabase.driver.cassandra.util
  "`*cassandra-connection*`, `with-cassandra-connection`, and other functions shared between several Cassandra driver namespaces."
  (:require [clojure.tools.logging :as log]
            [clojurewerkz.cassaforte.client :as cc]
            [clojurewerkz.cassaforte.cql    :as cql]
            [clojurewerkz.cassaforte.query :refer :all]
            (metabase [driver :as driver]
                      [util :as u])))

(def ^:dynamic ^com.datastax.driver.core.SessionManager *cassandra-connection*
  "Connection to a Cassandra cluster.
   Bound by top-level `with-cassandra-connection` so it may be reused within its body."
  nil)


; #metabase.models.database.DatabaseInstance{
;   :description nil, 
;   :features [], 
;   :name test-data, 
;   :caveats nil, 
;   :is_full_sync true, 
;   :updated_at #inst "2017-03-03T15:56:27.292000000-00:00", 
;   :details {:dbname test-data, :host localhost}, 
;   :is_sample false, 
;   :id 1, 
;   :engine :cassandra, 
;   :created_at #inst "2017-03-03T15:56:27.292000000-00:00", 
;   :points_of_interest nil}

(defn -with-cassandra-connection
  "Run F with a new connection (bound to `*cassandra-connection*`) to DATABASE.
   Don't use this directly; use `with-cassandra-connection`."
  [f database]
  (let [{:keys [dbname host port user pass ssl authdb]
         :or   {port 9042, pass "", ssl false}} (cond
                                                   (string? database)            {:dbname database}
                                                   (:dbname (:details database)) (:details database) ; from Database obj
                                                   (:dbname database)            database            ; from simple map
                                                   :else                         (throw (Exception. (str "with-cassandra-connection failed: bad connection details:" (:details database)))))
        _ (assert (some? host) "Please provide host")  
        conn (if dbname
                 ; (cc/connect [host] {:port port :keyspace dbname})
                 (cc/connect [host] {:port port})
                 (cc/connect [host] {:port port}))
        ]
    (log/debug (u/format-color 'cyan "<< OPENED NEW CASSANDRA CONNECTION >>"))
    (try
      (binding [*cassandra-connection* conn]
        (f *cassandra-connection*))
      (finally
        (cc/disconnect conn)))))

(defmacro with-cassandra-connection
  [[binding database] & body]
  `(let [f# (fn [~binding]
              ~@body)]
     (if *cassandra-connection*
       (f# *cassandra-connection*)
       (-with-cassandra-connection f# ~database))))



