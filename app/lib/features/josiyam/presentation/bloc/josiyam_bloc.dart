import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/usecases/get_single_josiyam.dart';
import '../../domain/usecases/get_stored_josiyam_result.dart';
import '../bloc/josiyam_event.dart';
import '../bloc/josiyam_state.dart';
import '../../data/datasources/josiyam_remote_datasource.dart';

class JosiyamBloc extends Bloc<JosiyamEvent, JosiyamState> {
  final GetSingleJosiyam _getSingleJosiyam;
  final GetStoredJosiyamResult _getStoredJosiyamResult;

  JosiyamBloc({
    required GetSingleJosiyam getSingleJosiyam,
    required GetStoredJosiyamResult getStoredJosiyamResult,
  })  : _getSingleJosiyam = getSingleJosiyam,
        _getStoredJosiyamResult = getStoredJosiyamResult,
        super(const SingleJosiyamInitial()) {
    on<FetchSingleJosiyamRequested>(_onFetchRequested);
    on<LoadSingleJosiyamByResultId>(_onLoadByResultId);
  }

  Future<void> _onFetchRequested(
    FetchSingleJosiyamRequested event,
    Emitter<JosiyamState> emit,
  ) async {
    emit(const SingleJosiyamLoading());
    try {
      final result = await _getSingleJosiyam.call(
        useProfile: event.useProfile,
        language: event.language,
      );
      emit(SingleJosiyamLoaded(result: result));
    } on JosiyamProfileIncompleteException catch (e) {
      emit(SingleJosiyamProfileIncomplete(missingFields: e.missingFields));
    } on JosiyamException catch (e) {
      emit(SingleJosiyamError(message: e.message));
    } catch (e) {
      emit(SingleJosiyamError(message: e.toString()));
    }
  }

  Future<void> _onLoadByResultId(
    LoadSingleJosiyamByResultId event,
    Emitter<JosiyamState> emit,
  ) async {
    emit(const SingleJosiyamLoading());
    try {
      final bundle = await _getStoredJosiyamResult(event.resultId);
      if (bundle.type != 'single' || bundle.single == null) {
        emit(const SingleJosiyamError(
          message: 'This result is not a single-person josiyam.',
        ));
        return;
      }
      emit(SingleJosiyamLoaded(result: bundle.single!));
    } on JosiyamException catch (e) {
      emit(SingleJosiyamError(message: e.message));
    } catch (e) {
      emit(SingleJosiyamError(message: e.toString()));
    }
  }
}
