

def remove_duplicates(dict_list):
    seen = set()
    result = []

    # 转换字典中所有的列表为元组
    def convert_lists_in_dict(d):
        return {k: tuple(v) if isinstance(v, list) else v for k, v in d.items()}

    for d in dict_list:
        # 先将字典中的列表转换为元组
        d_converted = convert_lists_in_dict(d)

        # 将转换后的字典变为 frozenset，以便去重
        dict_tuple = frozenset(d_converted.items())

        if dict_tuple not in seen:
            seen.add(dict_tuple)
            result.append(d)
    return result
