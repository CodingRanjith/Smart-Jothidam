import 'package:flutter_bloc/flutter_bloc.dart';

import '../../data/datasources/josiyam_remote_datasource.dart';
import '../../domain/usecases/get_couple_josiyam.dart';
import '../../domain/usecases/get_stored_josiyam_result.dart';
import '../../domain/usecases/list_partner_profiles.dart';
import 'couple_josiyam_event.dart';
import 'couple_josiyam_state.dart';

class CoupleJosiyamBloc extends Bloc<CoupleJosiyamEvent, CoupleJosiyamState> {
  final ListPartnerProfiles _listPartnerProfiles;
  final GetCoupleJosiyam _getCoupleJosiyam;
  final GetStoredJosiyamResult _getStoredJosiyamResult;

  CoupleJosiyamBloc({
    required ListPartnerProfiles listPartnerProfiles,
    required GetCoupleJosiyam getCoupleJosiyam,
    required GetStoredJosiyamResult getStoredJosiyamResult,
  })  : _listPartnerProfiles = listPartnerProfiles,
        _getCoupleJosiyam = getCoupleJosiyam,
        _getStoredJosiyamResult = getStoredJosiyamResult,
        super(const CoupleJosiyamInitial()) {
    on<LoadCouplePartnersRequested>(_onLoadPartners);
    on<FetchCoupleJosiyamRequested>(_onFetchCouple);
    on<ResetCoupleJosiyamForm>(_onResetForm);
    on<LoadCoupleJosiyamByResultId>(_onLoadByResultId);
  }

  Future<void> _onLoadPartners(
    LoadCouplePartnersRequested event,
    Emitter<CoupleJosiyamState> emit,
  ) async {
    emit(const CoupleJosiyamPartnersLoading());
    try {
      final partners = await _listPartnerProfiles();
      emit(CoupleJosiyamReady(partners: partners));
    } catch (e) {
      emit(CoupleJosiyamError(message: e.toString()));
    }
  }

  Future<void> _onFetchCouple(
    FetchCoupleJosiyamRequested event,
    Emitter<CoupleJosiyamState> emit,
  ) async {
    final snapshot = event.partnersSnapshot;
    emit(CoupleJosiyamSubmitting(partners: snapshot));

    try {
      final result = await _getCoupleJosiyam(event.body);
      emit(CoupleJosiyamLoadSuccess(
        result: result,
        partners: snapshot,
      ));
    } on JosiyamException catch (e) {
      emit(CoupleJosiyamError(message: e.message, partners: snapshot));
    } catch (e) {
      emit(CoupleJosiyamError(message: e.toString(), partners: snapshot));
    }
  }

  void _onResetForm(
    ResetCoupleJosiyamForm event,
    Emitter<CoupleJosiyamState> emit,
  ) {
    emit(CoupleJosiyamReady(partners: event.partners));
  }

  Future<void> _onLoadByResultId(
    LoadCoupleJosiyamByResultId event,
    Emitter<CoupleJosiyamState> emit,
  ) async {
    emit(const CoupleJosiyamPartnersLoading());
    try {
      final bundle = await _getStoredJosiyamResult(event.resultId);
      if (bundle.type != 'couple' || bundle.couple == null) {
        emit(CoupleJosiyamError(
          message: 'This result is not a couple josiyam.',
        ));
        return;
      }
      emit(CoupleJosiyamLoadSuccess(
        result: bundle.couple!,
        partners: const [],
      ));
    } on JosiyamException catch (e) {
      emit(CoupleJosiyamError(message: e.message));
    } catch (e) {
      emit(CoupleJosiyamError(message: e.toString()));
    }
  }
}
