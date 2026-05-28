import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/models/country_code.dart';

class CountryCodePicker extends StatelessWidget {
  final CountryCode selectedCountry;
  final ValueChanged<CountryCode> onChanged;

  /// Corner radius for the country pill (match phone field for side‑by‑side layout).
  final double borderRadius;

  /// Fixed row height so it aligns with the phone [TextFormField].
  final double height;
  final double width;

  final Color backgroundColor;

  final Color borderColor;

  const CountryCodePicker({
    super.key,
    required this.selectedCountry,
    required this.onChanged,
    this.borderRadius = 12,
    this.height = 52,
    this.width = 108,
    this.backgroundColor = const Color(0xFFF5F3F7),
    this.borderColor = const Color(0xFFE0D8E4),
  });

  @override
  Widget build(BuildContext context) {
    final radius = BorderRadius.circular(borderRadius);
    return SizedBox(
      width: width,
      height: height,
      child: InkWell(
        onTap: () => _showCountryPicker(context),
        borderRadius: radius,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: backgroundColor,
            borderRadius: radius,
            border: Border.all(color: borderColor, width: 1),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _FlagImage(countryCode: selectedCountry.flag, size: 22),
              const SizedBox(width: 8),
              Text(
                selectedCountry.dialCode,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF2F2A34),
                ),
              ),
              const SizedBox(width: 4),
              const Icon(
                Icons.keyboard_arrow_down_rounded,
                size: 20,
                color: Color(0xFF7E7788),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showCountryPicker(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _CountryPickerSheet(
        selectedCountry: selectedCountry,
        onSelected: onChanged,
      ),
    );
  }
}

class _CountryPickerSheet extends StatefulWidget {
  final CountryCode selectedCountry;
  final ValueChanged<CountryCode> onSelected;

  const _CountryPickerSheet({
    required this.selectedCountry,
    required this.onSelected,
  });

  @override
  State<_CountryPickerSheet> createState() => _CountryPickerSheetState();
}

class _CountryPickerSheetState extends State<_CountryPickerSheet> {
  final TextEditingController _searchController = TextEditingController();
  List<CountryCode> _filteredCountries = [];

  @override
  void initState() {
    super.initState();
    _filteredCountries = CountryCode.getAllCountries();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _filterCountries(String query) {
    setState(() {
      if (query.isEmpty) {
        _filteredCountries = CountryCode.getAllCountries();
      } else {
        final search = query.toLowerCase();
        _filteredCountries = CountryCode.getAllCountries()
            .where(
              (country) =>
                  country.name.toLowerCase().contains(search) ||
                  country.dialCode.contains(query) ||
                  country.code.toLowerCase().contains(search),
            )
            .toList();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.7,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          Container(
            margin: const EdgeInsets.only(top: 12),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: const Color(0xFFE1DCE5),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const Padding(
            padding: EdgeInsets.all(16),
            child: Row(
              children: [
                Text(
                  'Select Country',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF2F2A34),
                  ),
                ),
                Spacer(),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: TextField(
              controller: _searchController,
              onChanged: _filterCountries,
              decoration: InputDecoration(
                hintText: 'Search country',
                prefixIcon: const Icon(Icons.search),
                filled: true,
                fillColor: const Color(0xFFF5F1F7),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: ListView.builder(
              itemCount: _filteredCountries.length,
              itemBuilder: (context, index) {
                final country = _filteredCountries[index];
                final isSelected = country.code == widget.selectedCountry.code;

                return ListTile(
                  leading: _FlagImage(countryCode: country.flag, size: 24),
                  title: Text(
                    country.name,
                    style: TextStyle(
                      fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                      color: const Color(0xFF2F2A34),
                    ),
                  ),
                  trailing: Text(
                    country.dialCode,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: isSelected ? AppColors.burgundy : const Color(0xFF6C6674),
                    ),
                  ),
                  selected: isSelected,
                  selectedTileColor: AppColors.burgundySurface.withValues(alpha: 0.5),
                  onTap: () {
                    widget.onSelected(country);
                    Navigator.pop(context);
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _FlagImage extends StatelessWidget {
  final String countryCode;
  final double size;

  const _FlagImage({
    required this.countryCode,
    required this.size,
  });

  @override
  Widget build(BuildContext context) {
    final url = 'https://flagcdn.com/w40/${countryCode.toLowerCase()}.png';
    return ClipRRect(
      borderRadius: BorderRadius.circular(4),
      child: Image.network(
        url,
        width: size,
        height: size,
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => Container(
          width: size,
          height: size,
          color: const Color(0xFFE5E0E9),
          alignment: Alignment.center,
          child: Text(
            countryCode,
            style: const TextStyle(fontSize: 8, fontWeight: FontWeight.bold),
          ),
        ),
      ),
    );
  }
}
