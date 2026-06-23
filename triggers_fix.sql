DELIMITER ;;
CREATE TRIGGER after_insert_anuncio AFTER INSERT ON anuncio FOR EACH ROW BEGIN UPDATE desconto SET total_registros = total_registros + 1 WHERE hash = NEW.codDesconto; END;;

CREATE TRIGGER after_delete_anuncio AFTER DELETE ON anuncio FOR EACH ROW BEGIN UPDATE desconto SET total_registros = total_registros - 1 WHERE hash = OLD.codDesconto; END;;
DELIMITER ;
