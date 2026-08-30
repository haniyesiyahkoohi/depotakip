import pymysql

# mysqlclient (native C kütüphanesi) kurulumu zahmetli olduğu için
# saf Python olan PyMySQL'i onun yerine kullanıyoruz.
pymysql.install_as_MySQLdb()
