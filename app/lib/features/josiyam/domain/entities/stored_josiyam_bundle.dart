import 'couple_josiyam_result_entity.dart';
import 'josiyam_result_entity.dart';

/// GET `/api/josiyam/result/:id` — either single or couple payload.
class StoredJosiyamBundle {
  final String resultId;
  final String type;
  final JosiyamResultEntity? single;
  final CoupleJosiyamResultEntity? couple;

  const StoredJosiyamBundle({
    required this.resultId,
    required this.type,
    this.single,
    this.couple,
  });
}
