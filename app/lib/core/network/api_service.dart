import 'package:dio/dio.dart';
import 'dio_client.dart';

class ApiService {
  final DioClient _dioClient;

  ApiService(this._dioClient);

  // GET request
  Future<Response> get(
    String endpoint, {
    Map<String, dynamic>? queryParameters,
    Map<String, dynamic>? headers,
  }) async {
    try {
      final response = await _dioClient.dio.get(
        endpoint,
        queryParameters: queryParameters,
        options: headers != null ? Options(headers: headers) : null,
      );
      return response;
    } catch (e) {
      rethrow;
    }
  }

  /// Binary GET (e.g. PDF export).
  Future<Response> getBytes(
    String endpoint, {
    Map<String, dynamic>? queryParameters,
    Map<String, dynamic>? headers,
  }) async {
    return _dioClient.dio.get(
      endpoint,
      queryParameters: queryParameters,
      options: Options(
        headers: headers,
        responseType: ResponseType.bytes,
      ),
    );
  }

  // POST request
  Future<Response> post(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Map<String, dynamic>? headers,
  }) async {
    try {
      final response = await _dioClient.dio.post(
        endpoint,
        data: data,
        queryParameters: queryParameters,
        options: headers != null ? Options(headers: headers) : null,
      );
      return response;
    } catch (e) {
      rethrow;
    }
  }

  // PUT request
  Future<Response> put(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Map<String, dynamic>? headers,
  }) async {
    try {
      final response = await _dioClient.dio.put(
        endpoint,
        data: data,
        queryParameters: queryParameters,
        options: headers != null ? Options(headers: headers) : null,
      );
      return response;
    } catch (e) {
      rethrow;
    }
  }

  // DELETE request
  Future<Response> delete(
    String endpoint, {
    Map<String, dynamic>? queryParameters,
    Map<String, dynamic>? headers,
  }) async {
    try {
      final response = await _dioClient.dio.delete(
        endpoint,
        queryParameters: queryParameters,
        options: headers != null ? Options(headers: headers) : null,
      );
      return response;
    } catch (e) {
      rethrow;
    }
  }
}
